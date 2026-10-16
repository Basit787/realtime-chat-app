import type { StateCreator } from "zustand";
import type { ChatState, MessageDeliveryStatus } from "@/pages/chat/store/chat-types";

const STATUS_RANK: Record<MessageDeliveryStatus, number> = { sent: 0, delivered: 1, read: 2 };

/** Statuses only move forward (sent → delivered → read). */
export const furthestStatus = (a: MessageDeliveryStatus, b: MessageDeliveryStatus) =>
  STATUS_RANK[b] > STATUS_RANK[a] ? b : a;

export type ChatMessageStatusSlice = Pick<ChatState, "messageStatus" | "setMessageStatus">;

export const createChatMessageStatusSlice: StateCreator<ChatState, [], [], ChatMessageStatusSlice> = (set) => ({
  messageStatus: {},
  setMessageStatus: (messageId, status) =>
    set((s) => {
      const current = s.messageStatus[messageId];
      if (current && furthestStatus(current, status) === current) return s;
      return { messageStatus: { ...s.messageStatus, [messageId]: status } };
    }),
});
