export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: "starters" | "mains" | "sides" | "drinks" | "desserts";
  image: string;
  tags: string[];
  available: boolean;
}

export interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

export type OrderActionType =
  | "ADD_ITEM"
  | "REMOVE_ITEM"
  | "UPDATE_QUANTITY"
  | "CLEAR_CART"
  | "NO_ACTION";

export interface OrderAction {
  type: OrderActionType;
  menuItemId?: string;
  quantity?: number;
  notes?: string;
}

export interface AIResponse {
  message: string;
  actions: OrderAction[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface MenuResponse {
  items: MenuItem[];
}

export interface IntentRequest {
  message: string;
  cartContext: CartItem[];
}

export interface IntentResponse {
  reply: string;
  actions: OrderAction[];
}
