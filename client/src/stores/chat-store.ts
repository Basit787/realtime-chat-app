import { create } from "zustand";
import type { ChatMessage } from "@/lib/api";

export type UserStatus = "online" | "away" | "busy" | "offline";

export type Conversation = {
  id: string;
  name: string;
  type: "channel" | "dm" | "group";
  lastMessage?: string;
  lastAt?: string;
  online?: boolean;
};

type ChatState = {
  activeConversationId: string;
  onlineUsers: string[];
  typingUser: string | null;
  userStatus: UserStatus;
  searchQuery: string;
  messages: ChatMessage[];
  setActiveConversation: (id: string) => void;
  setOnlineUsers: (users: string[]) => void;
  setTypingUser: (user: string | null) => void;
  setUserStatus: (status: UserStatus) => void;
  setSearchQuery: (query: string) => void;
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  reset: () => void;
};

export const useChatStore = create<ChatState>((set) => ({
  activeConversationId: "general",
  onlineUsers: [],
  typingUser: null,
  userStatus: "online",
  searchQuery: "",
  messages: [],

  setActiveConversation: (id) => set({ activeConversationId: id }),
  setOnlineUsers: (users) => set({ onlineUsers: users }),
  setTypingUser: (user) => set({ typingUser: user }),
  setUserStatus: (status) => set({ userStatus: status }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((s) => ({ messages: [...s.messages, message] })),
  reset: () =>
    set({
      activeConversationId: "general",
      onlineUsers: [],
      typingUser: null,
      messages: [],
      searchQuery: "",
    }),
}));

export function buildConversations(
  messages: ChatMessage[],
  onlineUsers: string[],
  selfUsername: string,
): Conversation[] {
  const general: Conversation = {
    id: "general",
    name: "General",
    type: "channel",
    lastMessage: messages.at(-1)?.text,
    lastAt: messages.at(-1)?.at,
  };

  const peers = new Set<string>();
  onlineUsers.forEach((u) => {
    if (u !== selfUsername) peers.add(u);
  });
  messages.forEach((m) => {
    if (m.user !== selfUsername) peers.add(m.user);
  });

  const dms: Conversation[] = Array.from(peers).map((name) => {
    const thread = messages.filter((m) => m.user === name || m.user === selfUsername);
    const last = thread.at(-1);
    return {
      id: name,
      name,
      type: "dm" as const,
      online: onlineUsers.includes(name),
      lastMessage: last?.text,
      lastAt: last?.at,
    };
  });

  dms.sort((a, b) => {
    const aTime = a.lastAt ? new Date(a.lastAt).getTime() : 0;
    const bTime = b.lastAt ? new Date(b.lastAt).getTime() : 0;
    return bTime - aTime;
  });

  return [general, ...dms];
}

export function filterMessagesForConversation(
  messages: ChatMessage[],
  conversationId: string,
  selfUsername: string,
) {
  if (conversationId === "general") return messages;
  return messages.filter((m) => m.user === conversationId || m.user === selfUsername);
}
