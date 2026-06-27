import type { StateCreator } from "zustand";
import type { ChatState, MessageDeliveryStatus } from "@/pages/chat/store/chat-types";

export type ChatMessageStatusSlice = Pick<ChatState, "messageStatus" | "setMessageStatus">;

export const createChatMessageStatusSlice: StateCreator<ChatState, [], [], ChatMessageStatusSlice> = (set) => ({
  messageStatus: {},
  setMessageStatus: (messageId, status) =>
    set((s) => {
      const current = s.messageStatus[messageId];
      const rank: Record<MessageDeliveryStatus, number> = { sent: 0, delivered: 1, read: 2 };
      if (current && rank[current] >= rank[status]) return s;
      return { messageStatus: { ...s.messageStatus, [messageId]: status } };
    }),
});
