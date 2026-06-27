import type { StateCreator } from "zustand";
import type { ChatState } from "@/pages/chat/store/chat-types";

export type ChatMessagesDataSlice = Pick<ChatState, "setMessages" | "mergeMessages">;

export const createChatMessagesDataSlice: StateCreator<ChatState, [], [], ChatMessagesDataSlice> = (set) => ({
  setMessages: (messages) => set({ messages }),
  mergeMessages: (room, roomMessages) =>
    set((s) => {
      const others = s.messages.filter((m) => m.room !== room);
      return { messages: [...others, ...roomMessages].sort((a, b) => a.at.localeCompare(b.at)) };
    }),
});
