import { create } from "zustand";

export type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
  cartAction?: {
    action: string;
    items: { itemId: string; name: string; qty: number }[];
  };
};

type ChatStore = {
  messages: Message[];
  isLoading: boolean;
  addMessage: (msg: Message) => void;
  setLoading: (val: boolean) => void;
};

export const useChatStore = create<ChatStore>((set) => ({
  messages: [
    {
      id: "welcome",
      role: "assistant",
      text: "Hi! I'm your Bistro assistant. Try: 'Add 2 spicy chicken sandwiches and a water'",
    },
  ],
  isLoading: false,
  addMessage: (msg) =>
    set((state) => ({ messages: [...state.messages, msg] })),
  setLoading: (val) => set({ isLoading: val }),
}));
