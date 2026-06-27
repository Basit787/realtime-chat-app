import type { CallHistoryEntry, ChatMessage, ChatGroup } from "@/pages/chat/api/api";

export type UserStatus = "online" | "away" | "busy" | "offline";

export type SidebarView = "conversations" | "profile" | "calls";

export type Conversation = {
  id: string;
  name: string;
  type: "channel" | "dm" | "group";
  room: string;
  lastMessage?: string;
  lastAt?: string;
  online?: boolean;
  presenceStatus?: UserStatus;
};

export type ChatState = {
  activeConversationId: string;
  sidebarView: SidebarView;
  onlineUsers: string[];
  userStatuses: Record<string, UserStatus>;
  typingUser: string | null;
  typingRoom: string | null;
  userStatus: UserStatus;
  searchQuery: string;
  messages: ChatMessage[];
  groups: ChatGroup[];
  knownContacts: string[];
  callHistory: CallHistoryEntry[];
  hiddenMessageIds: Set<string>;
  replyTo: ChatMessage | null;
  forwardMessage: ChatMessage | null;
  setActiveConversation: (id: string) => void;
  setSidebarView: (view: SidebarView) => void;
  setOnlineUsers: (users: string[]) => void;
  mergeUserStatuses: (statuses: Record<string, UserStatus>) => void;
  setTypingUser: (room: string, user: string | null) => void;
  setUserStatus: (status: UserStatus) => void;
  setSearchQuery: (query: string) => void;
  setMessages: (messages: ChatMessage[]) => void;
  setGroups: (groups: ChatGroup[]) => void;
  setKnownContacts: (contacts: string[]) => void;
  addGroup: (group: ChatGroup) => void;
  updateGroup: (group: ChatGroup) => void;
  mergeMessages: (room: string, messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  setCallHistory: (calls: CallHistoryEntry[]) => void;
  mergeCallHistory: (calls: CallHistoryEntry[]) => void;
  addCallHistory: (call: CallHistoryEntry) => void;
  removeMessage: (id: string) => void;
  markMessageDeleted: (message: ChatMessage) => void;
  restoreMessage: (message: ChatMessage) => void;
  hideMessageForMe: (id: string) => void;
  unhideMessageForMe: (id: string) => void;
  setReplyTo: (message: ChatMessage | null) => void;
  setForwardMessage: (message: ChatMessage | null) => void;
  reset: () => void;
};
