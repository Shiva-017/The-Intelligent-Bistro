import { create } from "zustand";
import { CartItem, MenuItem, OrderAction } from "../../../packages/types/src";

interface CartStore {
  items: CartItem[];
  add: (item: MenuItem, quantity?: number, notes?: string) => void;
  remove: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  applyActions: (actions: OrderAction[], menuItems: MenuItem[]) => void;
  clear: () => void;
  total: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  add: (item, quantity = 1, notes) => {
    set((state) => {
      const existing = state.items.find((i) => i.menuItemId === item.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.menuItemId === item.id
              ? { ...i, quantity: i.quantity + quantity, notes: notes ?? i.notes }
              : i
          ),
        };
      }
      return {
        items: [
          ...state.items,
          { menuItemId: item.id, name: item.name, price: item.price, quantity, notes },
        ],
      };
    });
  },

  remove: (menuItemId) => {
    set((state) => ({ items: state.items.filter((i) => i.menuItemId !== menuItemId) }));
  },

  updateQuantity: (menuItemId, quantity) => {
    if (quantity <= 0) {
      get().remove(menuItemId);
      return;
    }
    set((state) => ({
      items: state.items.map((i) => (i.menuItemId === menuItemId ? { ...i, quantity } : i)),
    }));
  },

  applyActions: (actions, menuItems) => {
    actions.forEach((action) => {
      const menuItem = menuItems.find((m) => m.id === action.menuItemId);
      switch (action.type) {
        case "ADD_ITEM":
          if (menuItem) get().add(menuItem, action.quantity ?? 1, action.notes);
          break;
        case "REMOVE_ITEM":
          if (action.menuItemId) get().remove(action.menuItemId);
          break;
        case "UPDATE_QUANTITY":
          if (action.menuItemId && action.quantity !== undefined) {
            get().updateQuantity(action.menuItemId, action.quantity);
          }
          break;
        case "CLEAR_CART":
          get().clear();
          break;
      }
    });
  },

  clear: () => set({ items: [] }),

  total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

  itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}));
