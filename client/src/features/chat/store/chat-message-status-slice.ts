import type { StateCreator } from "zustand";
import { furthestStatus } from "#/common";
import type { ChatState } from "@/features/chat/store/chat-types";


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
