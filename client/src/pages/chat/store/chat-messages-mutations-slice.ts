import { messageKey } from "@/lib/messages";
import type { StateCreator } from "zustand";
import type { ChatState } from "@/pages/chat/store/chat-types";

export type ChatMessagesMutationsSlice = Pick<ChatState, "addMessage" | "removeMessage">;

export const createChatMessagesMutationsSlice: StateCreator<ChatState, [], [], ChatMessagesMutationsSlice> = (
  set,
) => ({
  addMessage: (message) =>
    set((s) => {
      const key = messageKey(message);
      if (s.messages.some((m) => messageKey(m) === key)) {
        return s;
      }
      return { messages: [...s.messages, message].sort((a, b) => a.at.localeCompare(b.at)) };
    }),
  removeMessage: (id) =>
    set((s) => ({
      messages: s.messages.filter((m) => m.id !== id),
    })),
});
