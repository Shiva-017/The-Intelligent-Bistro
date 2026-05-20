import { create } from "zustand";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
};

export type AIAction = {
  action: "add" | "remove" | "update" | "clear" | "none";
  items: { itemId: string; name: string; qty: number; price?: number }[];
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
    items.forEach((item) => {
      if (action === "add") {
        get().addItem({
          id: item.itemId,
          name: item.name,
          price: item.price ?? 0,
          qty: item.qty,
        });
      } else if (action === "remove") {
        get().removeItem(item.itemId);
      } else if (action === "update") {
        get().updateQty(item.itemId, item.qty);
      }
    });
  },
  totalPrice: () =>
    get().items.reduce((acc, i) => acc + i.price * i.qty, 0),
}));
