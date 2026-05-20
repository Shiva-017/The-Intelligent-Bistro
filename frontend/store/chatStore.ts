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
      text: "Bonjour, I'm Claude — your virtual waiter at The Bistro. 🍷\n\nTell me what you're craving and I'll get it on your tab. Try: \"a spicy chicken sandwich, two lemonades, and something sweet for after.\"",
    },
  ],
  isLoading: false,
  addMessage: (msg) =>
    set((state) => ({ messages: [...state.messages, msg] })),
  setLoading: (val) => set({ isLoading: val }),
}));
