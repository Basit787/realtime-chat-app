import { create } from "zustand";
import type { ChatMessage } from "@/pages/chat/api/api";
import { GENERAL_ROOM } from "@/pages/chat/api/api";
import { dmPeerFromRoom, parseDmRoom } from "@/lib/rooms";

export type UserStatus = "online" | "away" | "busy" | "offline";

export type Conversation = {
  id: string;
  name: string;
  type: "channel" | "dm" | "group";
  room: string;
  lastMessage?: string;
  lastAt?: string;
  online?: boolean;
};

type ChatState = {
  activeConversationId: string;
  onlineUsers: string[];
  typingUser: string | null;
  typingRoom: string | null;
  userStatus: UserStatus;
  searchQuery: string;
  messages: ChatMessage[];
  setActiveConversation: (id: string) => void;
  setOnlineUsers: (users: string[]) => void;
  setTypingUser: (room: string, user: string | null) => void;
  setUserStatus: (status: UserStatus) => void;
  setSearchQuery: (query: string) => void;
  setMessages: (messages: ChatMessage[]) => void;
  mergeMessages: (room: string, messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  reset: () => void;
};

export const useChatStore = create<ChatState>((set) => ({
  activeConversationId: GENERAL_ROOM,
  onlineUsers: [],
  typingUser: null,
  typingRoom: null,
  userStatus: "online",
  searchQuery: "",
  messages: [],

  setActiveConversation: (id) => set({ activeConversationId: id, typingUser: null, typingRoom: null }),
  setOnlineUsers: (users) => set({ onlineUsers: users }),
  setTypingUser: (room, user) => set({ typingRoom: room, typingUser: user }),
  setUserStatus: (status) => set({ userStatus: status }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setMessages: (messages) => set({ messages }),
  mergeMessages: (room, roomMessages) =>
    set((s) => {
      const others = s.messages.filter((m) => m.room !== room);
      return { messages: [...others, ...roomMessages].sort((a, b) => a.at.localeCompare(b.at)) };
    }),
  addMessage: (message) =>
    set((s) => {
      if (s.messages.some((m) => m.room === message.room && m.at === message.at && m.user === message.user)) {
        return s;
      }
      return { messages: [...s.messages, message].sort((a, b) => a.at.localeCompare(b.at)) };
    }),
  reset: () =>
    set({
      activeConversationId: GENERAL_ROOM,
      onlineUsers: [],
      typingUser: null,
      typingRoom: null,
      messages: [],
      searchQuery: "",
    }),
}));

export function buildConversations(
  messages: ChatMessage[],
  onlineUsers: string[],
  selfUsername: string,
): Conversation[] {
  const generalMessages = messages.filter((m) => m.room === GENERAL_ROOM);
  const general: Conversation = {
    id: GENERAL_ROOM,
    name: "General",
    type: "channel",
    room: GENERAL_ROOM,
    lastMessage: generalMessages.at(-1)?.text,
    lastAt: generalMessages.at(-1)?.at,
  };

  const dmRooms = new Set<string>();
  messages.forEach((m) => {
    if (parseDmRoom(m.room)) dmRooms.add(m.room);
  });
  onlineUsers.forEach((u) => {
    if (u !== selfUsername) dmRooms.add(`dm..${[selfUsername, u].sort().join("..")}`);
  });

  const dms: Conversation[] = Array.from(dmRooms).map((room) => {
    const peer = dmPeerFromRoom(room, selfUsername) ?? "Unknown";
    const thread = messages.filter((m) => m.room === room);
    const last = thread.at(-1);
    return {
      id: peer,
      name: peer,
      type: "dm" as const,
      room,
      online: onlineUsers.includes(peer),
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

export function messagesForConversation(messages: ChatMessage[], conversationId: string, selfUsername: string) {
  const room =
    conversationId === GENERAL_ROOM ? GENERAL_ROOM : `dm..${[selfUsername, conversationId].sort().join("..")}`;
  return messages.filter((m) => m.room === room);
}
