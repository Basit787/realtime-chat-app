import { GENERAL_ROOM } from "@/pages/chat/api/api";
import { dmPeerFromRoom, parseDmRoom, isGroupRoom, dmRoomName } from "@/lib/rooms";
import { messageKey, messagePreview } from "@/lib/messages";
import { effectivePresenceStatus } from "@/lib/presence";
import type { CallHistoryEntry, ChatMessage } from "@/pages/chat/api/api";
import type { ChatGroup } from "@/pages/chat/api/api";
import type { Conversation, UserStatus } from "@/pages/chat/store/chat-types";

export const buildConversations = (
  messages: ChatMessage[],
  onlineUsers: string[],
  selfUsername: string,
  groups: ChatGroup[] = [],
  callHistory: CallHistoryEntry[] = [],
  knownContacts: string[] = [],
  userStatuses: Record<string, UserStatus> = {},
): Conversation[] => {
  const generalMessages = messages.filter((m) => m.room === GENERAL_ROOM);
  const generalLast = generalMessages.at(-1);
  const general: Conversation = {
    id: GENERAL_ROOM,
    name: "General",
    type: "channel",
    room: GENERAL_ROOM,
    lastMessage: generalLast ? (generalLast.deleted ? messagePreview(generalLast) : generalLast.text) : undefined,
    lastAt: generalLast?.at,
  };

  const groupConversations: Conversation[] = groups.map((group) => {
    const thread = messages.filter((m) => m.room === group.room);
    const last = thread.at(-1);
    return {
      id: group.room,
      name: group.name,
      type: "group" as const,
      room: group.room,
      lastMessage: last ? (last.deleted ? messagePreview(last) : last.text) : undefined,
      lastAt: last?.at,
    };
  });

  const dmRooms = new Set<string>();
  messages.forEach((m) => {
    if (parseDmRoom(m.room)) dmRooms.add(m.room);
  });
  callHistory.forEach((call) => {
    const peer = call.caller === selfUsername ? call.callee : call.caller;
    if (peer !== selfUsername) dmRooms.add(dmRoomName(selfUsername, peer));
  });
  knownContacts.forEach((peer) => {
    if (peer !== selfUsername) dmRooms.add(dmRoomName(selfUsername, peer));
  });
  onlineUsers.forEach((u) => {
    if (u !== selfUsername) dmRooms.add(dmRoomName(selfUsername, u));
  });

  const dms: Conversation[] = Array.from(dmRooms).map((room) => {
    const peer = dmPeerFromRoom(room, selfUsername) ?? "Unknown";
    const thread = messages.filter((m) => m.room === room);
    const last = thread.at(-1);
    const presenceStatus = effectivePresenceStatus(peer, onlineUsers, userStatuses);
    return {
      id: peer,
      name: peer,
      type: "dm" as const,
      room,
      online: presenceStatus === "online",
      presenceStatus,
      lastMessage: last ? (last.deleted ? messagePreview(last) : last.text) : undefined,
      lastAt: last?.at,
    };
  });

  const sorted = [...groupConversations, ...dms].sort((a, b) => {
    const aTime = a.lastAt ? new Date(a.lastAt).getTime() : 0;
    const bTime = b.lastAt ? new Date(b.lastAt).getTime() : 0;
    return bTime - aTime;
  });

  return [general, ...sorted];
};

export const callsForConversation = (calls: CallHistoryEntry[], conversationId: string, selfUsername: string) => {
  if (conversationId === GENERAL_ROOM) return [];
  return calls.filter(
    (c) =>
      (c.caller === selfUsername && c.callee === conversationId) ||
      (c.caller === conversationId && c.callee === selfUsername),
  );
};

export const messagesForConversation = (
  messages: ChatMessage[],
  conversationId: string,
  selfUsername: string,
  hiddenMessageIds: Set<string> = new Set(),
) => {
  const room = isGroupRoom(conversationId)
    ? conversationId
    : conversationId === GENERAL_ROOM
      ? GENERAL_ROOM
      : `dm..${[selfUsername, conversationId].sort().join("..")}`;
  return messages.filter((m) => m.room === room && !hiddenMessageIds.has(messageKey(m)));
};
