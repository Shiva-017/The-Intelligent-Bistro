import Anthropic from "@anthropic-ai/sdk";
import { CartItem, IntentResponse, MenuItem, OrderAction } from "../../../packages/types/src";
import { menu } from "../data/menu";

const client = new Anthropic();

function buildMenuContext(items: MenuItem[]): string {
  return items
    .map((item) => `- ${item.name} (id: ${item.id}, $${item.price}, ${item.category})`)
    .join("\n");
}

function buildCartContext(cart: CartItem[]): string {
  if (cart.length === 0) return "Cart is empty.";
  return cart
    .map((item) => `- ${item.name} x${item.quantity} ($${item.price * item.quantity})`)
    .join("\n");
}

const SYSTEM_PROMPT = `You are a friendly, concise AI ordering assistant for The Intelligent Bistro. Your job is to help guests browse the menu and manage their cart through natural conversation.

You have access to the full menu and current cart state. When a user asks to add, remove, or change items, you MUST return a JSON response with structured cart actions alongside your reply.

RESPONSE FORMAT — always return valid JSON matching this schema:
{
  "reply": "string — your conversational response to the guest",
  "actions": [
    {
      "type": "ADD_ITEM" | "REMOVE_ITEM" | "UPDATE_QUANTITY" | "CLEAR_CART" | "NO_ACTION",
      "menuItemId": "string — item id from the menu (omit for CLEAR_CART and NO_ACTION)",
      "quantity": "number — desired total quantity after the action (omit for REMOVE_ITEM, CLEAR_CART, NO_ACTION)",
      "notes": "string — optional special instructions for the item"
    }
  ]
}

Rules:
- Resolve item names to their exact menu IDs (case-insensitive, handle plurals and shorthand).
- If the user says "remove", "take off", or "delete", use REMOVE_ITEM.
- If the user changes quantity ("make it 3", "add one more"), use UPDATE_QUANTITY with the new total quantity.
- If the item is not on the menu, apologize and suggest the closest match.
- If the request is purely conversational (no cart changes), return actions: [] and type NO_ACTION.
- Keep replies warm, short, and helpful. No more than 2 sentences unless listing items.`;

export async function parseOrderIntent(
  message: string,
  cart: CartItem[]
): Promise<IntentResponse> {
  const userMessage = `
CURRENT MENU:
${buildMenuContext(menu)}

CURRENT CART:
${buildCartContext(cart)}

GUEST SAYS: "${message}"
`.trim();

  const response = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const raw = response.content[0];
  if (raw.type !== "text") {
    throw new Error("Unexpected response type from AI");
  }

  const jsonMatch = raw.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("AI response did not contain valid JSON");
  }

  const parsed = JSON.parse(jsonMatch[0]) as { reply: string; actions: OrderAction[] };

  return {
    reply: parsed.reply,
    actions: parsed.actions ?? [],
  };
}
