const Anthropic = require("@anthropic-ai/sdk");
const menu = require("../data/menu");

const client = new Anthropic.default();

const UPDATE_CART_TOOL = {
  name: "update_cart",
  description:
    "Update the customer's cart based on their order request. Always call this tool — even when no cart change is needed, use action 'none' and put your reply in the reply field.",
  input_schema: {
    type: "object",
    properties: {
      action: {
        type: "string",
        enum: ["add", "remove", "update", "clear", "none"],
        description:
          "The cart operation to perform. Use 'none' for questions, recommendations, or any message that doesn't change the cart.",
      },
      items: {
        type: "array",
        description: "Items affected by the action. Empty array for 'clear' and 'none'.",
        items: {
          type: "object",
          properties: {
            itemId: { type: "string", description: "The id field from the menu" },
            name: { type: "string", description: "Human-readable item name" },
            qty: { type: "integer", minimum: 1, description: "Quantity" },
          },
          required: ["itemId", "name", "qty"],
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

function buildSystemPrompt() {
  return `You are a friendly, knowledgeable AI assistant for The Bistro, a modern restaurant.
Your job is to help customers browse the menu and manage their order through natural conversation.

FULL MENU:
${JSON.stringify(menu, null, 2)}

Rules:
- Always respond by calling the update_cart tool — never reply with plain text.
- Resolve item names case-insensitively. Handle plurals and shorthand (e.g. "lava cake" → ds1).
- For add/update, include the correct itemId from the menu above.
- For 'update', qty is the new total quantity (not a delta).
- Keep replies warm and brief. One or two sentences max unless listing items.
- If an item is not on the menu, say so and suggest something similar.
- Never invent items or prices that aren't in the menu.`;
}

async function processOrder(userMessage, cartItems = [], conversationHistory = []) {
  const messages = [
    ...conversationHistory,
    { role: "user", content: userMessage },
  ];

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: buildSystemPrompt(),
    tools: [UPDATE_CART_TOOL],
    tool_choice: { type: "any" },
    messages,
  });

  const toolUse = response.content.find((block) => block.type === "tool_use");

  if (toolUse) {
    return toolUse.input;
  }

  const textBlock = response.content.find((block) => block.type === "text");
  return {
    action: "none",
    items: [],
    reply: textBlock?.text ?? "Sorry, I didn't understand that. Could you rephrase?",
  };
}

module.exports = { processOrder };
