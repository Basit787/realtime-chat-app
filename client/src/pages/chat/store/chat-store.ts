import { create } from "zustand";
import { GENERAL_ROOM } from "@/pages/chat/api/api";
import { getHiddenMessageIds } from "@/lib/hidden-messages";
import { createChatCallsDataSlice } from "@/pages/chat/store/chat-calls-data-slice";
import { createChatCallsMutationsSlice } from "@/pages/chat/store/chat-calls-mutations-slice";
import { createChatComposeSlice } from "@/pages/chat/store/chat-compose-slice";
import { createChatGroupsDataSlice } from "@/pages/chat/store/chat-groups-data-slice";
import { createChatGroupsMutationsSlice } from "@/pages/chat/store/chat-groups-mutations-slice";
import { createChatMessagesDataSlice } from "@/pages/chat/store/chat-messages-data-slice";
import { createChatMessagesDeleteSlice } from "@/pages/chat/store/chat-messages-delete-slice";
import { createChatMessagesHiddenSlice } from "@/pages/chat/store/chat-messages-hidden-slice";
import { createChatMessagesMutationsSlice } from "@/pages/chat/store/chat-messages-mutations-slice";
import { createChatNavigationSlice } from "@/pages/chat/store/chat-navigation-slice";
import { createChatPresenceSlice } from "@/pages/chat/store/chat-presence-slice";
import { createChatResetSlice } from "@/pages/chat/store/chat-reset-slice";
import { createChatSearchSlice } from "@/pages/chat/store/chat-search-slice";
import { createChatUserStatusSlice } from "@/pages/chat/store/chat-user-status-slice";
import type { ChatState } from "@/pages/chat/store/chat-types";

export type {
  ChatState,
  Conversation,
  SidebarView,
  UserStatus,
} from "@/pages/chat/store/chat-types";

export {
  buildConversations,
  callsForConversation,
  messagesForConversation,
} from "@/pages/chat/store/conversation-utils";

export const useChatStore = create<ChatState>()((...args) => ({
  activeConversationId: GENERAL_ROOM,
  sidebarView: "conversations",
  onlineUsers: [],
  userStatuses: {},
  typingUser: null,
  typingRoom: null,
  userStatus: "online",
  searchQuery: "",
  messages: [],
  groups: [],
  knownContacts: [],
  callHistory: [],
  hiddenMessageIds: getHiddenMessageIds(),
  replyTo: null,
  forwardMessage: null,
  ...createChatNavigationSlice(...args),
  ...createChatSearchSlice(...args),
  ...createChatComposeSlice(...args),
  ...createChatResetSlice(...args),
  ...createChatPresenceSlice(...args),
  ...createChatUserStatusSlice(...args),
  ...createChatMessagesDataSlice(...args),
  ...createChatMessagesMutationsSlice(...args),
  ...createChatMessagesDeleteSlice(...args),
  ...createChatMessagesHiddenSlice(...args),
  ...createChatGroupsDataSlice(...args),
  ...createChatGroupsMutationsSlice(...args),
  ...createChatCallsDataSlice(...args),
  ...createChatCallsMutationsSlice(...args),
}));
