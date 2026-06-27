import type { StateCreator } from "zustand";
import type { ChatState } from "@/pages/chat/store/chat-types";

export type ChatComposeSlice = Pick<ChatState, "setReplyTo" | "setForwardMessage">;

export const createChatComposeSlice: StateCreator<ChatState, [], [], ChatComposeSlice> = (set) => ({
  setReplyTo: (message) => set({ replyTo: message, forwardMessage: null }),
  setForwardMessage: (message) => set({ forwardMessage: message, replyTo: null }),
});
