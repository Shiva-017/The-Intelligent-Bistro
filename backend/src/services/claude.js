const Anthropic = require("@anthropic-ai/sdk");
const menu = require("../data/menu");

const client = new Anthropic.default();

// Build a quick lookup map so price enrichment is O(1)
const menuById = Object.fromEntries(menu.map((item) => [item.id, item]));

const UPDATE_CART_TOOL = {
  name: "update_cart",
  description:
    "Update the customer's cart. Call this for every message — use action 'none' if nothing changes.",
  input_schema: {
    type: "object",
    properties: {
      action: {
        type: "string",
        enum: ["changes", "clear", "none"],
        description:
          "'changes': apply the items array (each item has its own op). 'clear': empty the whole cart. 'none': no cart change (questions, recommendations, etc.).",
      },
      items: {
        type: "array",
        description:
          "Cart changes. Each entry has its own op. Empty array for 'clear' or 'none'.",
        items: {
          type: "object",
          properties: {
            op: {
              type: "string",
              enum: ["add", "update", "remove"],
              description:
                "'add': item is NOT currently in the cart. 'update': item IS in the cart — qty is the new total, not a delta. 'remove': delete from cart.",
            },
            itemId: { type: "string", description: "The id field from the menu" },
            name: { type: "string", description: "Human-readable item name" },
            qty: { type: "integer", minimum: 1, description: "Quantity (omit for remove)" },
          },
          required: ["op", "itemId", "name"],
        },
      },
      reply: {
        type: "string",
        description: "A warm, concise message to display to the customer.",
      },
    },
    required: ["action", "items", "reply"],
  },
};

function buildSystemPrompt(cartItems = []) {
  const cartSummary =
    cartItems.length === 0
      ? "The cart is currently EMPTY."
      : "Current cart:\n" +
        cartItems
          .map((i) => `  - ${i.name} (itemId: ${i.id}), qty: ${i.qty}`)
          .join("\n");

  return `You are a friendly, knowledgeable AI assistant for The Bistro, a modern restaurant.
Your job is to help customers browse the menu and manage their order through natural conversation.

FULL MENU:
${JSON.stringify(menu, null, 2)}

${cartSummary}

Rules:
- Always respond by calling the update_cart tool — never reply with plain text.
- Resolve item names case-insensitively. Handle plurals and shorthand (e.g. "lava cake" → ds1).
- Use action "changes" whenever anything in the cart changes. Each item in the array carries its own op:
    • op "add"    — item is NOT in the current cart (new item).
    • op "update" — item IS already in the cart; qty = desired final total (not a delta).
    • op "remove" — delete the item from the cart entirely.
- Use action "clear" to empty the whole cart; items array must be empty.
- Use action "none" for questions, recommendations, or any message that doesn't modify the cart; items array must be empty.
- Only include items that are actually changing. Never re-list unchanged items.
- Swap detection: if the customer says they want to "try", "switch to", "have", or "go with" a different dish from the same category as something already in their cart — and they do NOT say "as well", "also", "too", or "and" — treat it as a replacement: remove the old item, add the new one.
- Keep replies warm and brief. One or two sentences max unless listing items.
- If an item is not on the menu, say so and suggest something similar.
- Never invent items or prices that aren't in the menu.`;
}

// Enrich each item with the price from the menu data.
// Claude does not return price — the frontend needs it to display totals.
function enrichWithPrice(items = []) {
  return items.map((item) => ({
    ...item,
    price: menuById[item.itemId]?.price ?? 0,
  }));
}

async function processOrder(userMessage, cartItems = [], conversationHistory = []) {
  // Sanitize history: frontend sends { id, role, text, cartAction? }
  // Claude API needs { role, content } only.
  const sanitizedHistory = conversationHistory
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role,
      content: m.text ?? m.content ?? "",
    }))
    .filter((m) => m.content.length > 0);

  const messages = [
    ...sanitizedHistory,
    { role: "user", content: userMessage },
  ];

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: buildSystemPrompt(cartItems),
    tools: [UPDATE_CART_TOOL],
    tool_choice: { type: "any" },
    messages,
  });

  const toolUse = response.content.find((block) => block.type === "tool_use");

  if (toolUse) {
    const { action, items, reply } = toolUse.input;
    return {
      reply: reply ?? "",
      action: action ?? "none",
      items: enrichWithPrice(items ?? []),
    };
  }

  const textBlock = response.content.find((block) => block.type === "text");
  return {
    reply: textBlock?.text ?? "Sorry, I didn't understand that. Could you rephrase?",
    action: "none",
    items: [],
  };
}

module.exports = { processOrder };
