import { GENERAL_ROOM } from "@/pages/chat/api/api";
import type { StateCreator } from "zustand";
import type { ChatState } from "@/pages/chat/store/chat-types";

export type ChatResetSlice = Pick<ChatState, "reset">;

export const createChatResetSlice: StateCreator<ChatState, [], [], ChatResetSlice> = (set) => ({
  reset: () =>
    set({
      activeConversationId: GENERAL_ROOM,
      sidebarView: "conversations",
      onlineUsers: [],
      userStatuses: {},
      typingUser: null,
      typingRoom: null,
      userStatus: "online",
      messages: [],
      groups: [],
      knownContacts: [],
      callHistory: [],
      hiddenMessageIds: new Set(),
      replyTo: null,
      forwardMessage: null,
      searchQuery: "",
    }),
});
