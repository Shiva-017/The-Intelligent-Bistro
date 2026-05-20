import { create } from "zustand";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
};

export type AIAction = {
  action: string;
  items: { itemId: string; name: string; qty: number; price?: number; op?: string }[];
};

type CartStore = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  applyAIAction: (action: AIAction) => void;
  totalPrice: () => number;
};

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  addItem: (item) =>
    set((state) => {
      const existing = state.items.find((i) => i.id === item.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === item.id ? { ...i, qty: i.qty + item.qty } : i
          ),
        };
      }
      return { items: [...state.items, item] };
    }),
  removeItem: (id) =>
    set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
  updateQty: (id, qty) =>
    set((state) => ({
      items:
        qty <= 0
          ? state.items.filter((i) => i.id !== id)
          : state.items.map((i) => (i.id === id ? { ...i, qty } : i)),
    })),
  clearCart: () => set({ items: [] }),
  applyAIAction: (aiAction) => {
    const { action, items } = aiAction;
    if (action === "clear") {
      get().clearCart();
      return;
    }
    if (action === "none") return;
    // action === "changes" (or legacy add/update/remove for safety)
    items.forEach((item) => {
      // per-item op takes priority; fall back to top-level action for old responses
      const op = item.op ?? action;
      const existing = get().items.find((i) => i.id === item.itemId);

      if (op === "remove") {
        get().removeItem(item.itemId);
      } else if (op === "update") {
        if (existing) {
          get().updateQty(item.itemId, item.qty);
        } else {
          // defensive: Claude said update but item isn't in cart — add it
          get().addItem({ id: item.itemId, name: item.name, price: item.price ?? 0, qty: item.qty ?? 1 });
        }
      } else {
        // "add" or any unknown op
        if (existing) {
          // defensive: Claude said add but item exists — set to new qty instead of accumulating
          get().updateQty(item.itemId, item.qty);
        } else {
          get().addItem({ id: item.itemId, name: item.name, price: item.price ?? 0, qty: item.qty ?? 1 });
        }
      }
    });
  },
  totalPrice: () =>
    get().items.reduce((acc, i) => acc + i.price * i.qty, 0),
}));
