import type { StateCreator } from "zustand";
import type { ChatState } from "@/pages/chat/store/chat-types";

export type ChatNavigationSlice = Pick<ChatState, "setActiveConversation" | "setSidebarView">;

export const createChatNavigationSlice: StateCreator<ChatState, [], [], ChatNavigationSlice> = (set) => ({
  setActiveConversation: (id) => set({ activeConversationId: id, typingUser: null, typingRoom: null }),
  setSidebarView: (view) => set({ sidebarView: view }),
});
