import { create } from "zustand";

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  popular: boolean;
  spicy: boolean;
};

type MenuStore = {
  items: MenuItem[];
  setItems: (items: MenuItem[]) => void;
};

export const useMenuStore = create<MenuStore>((set) => ({
  items: [],
  setItems: (items) => set({ items }),
}));
