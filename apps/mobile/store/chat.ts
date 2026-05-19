import { create } from "zustand";
import { ChatMessage } from "../../../packages/types/src";

interface ChatStore {
  messages: ChatMessage[];
  isLoading: boolean;
  addMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => void;
  setLoading: (loading: boolean) => void;
  clear: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isLoading: false,

  addMessage: (message) => {
    const full: ChatMessage = {
      ...message,
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      timestamp: Date.now(),
    };
    set((state) => ({ messages: [...state.messages, full] }));
  },

  setLoading: (loading) => set({ isLoading: loading }),

  clear: () => set({ messages: [] }),
}));
