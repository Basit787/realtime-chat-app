export const GENERAL_ROOM = "general";
const GROUP_PREFIX = "group..";

export const dmRoomName = (userA: string, userB: string) => {
  const [a, b] = [userA, userB].sort();
  return `dm..${a}..${b}`;
};

export const isGroupRoom = (roomOrId: string) => roomOrId.startsWith(GROUP_PREFIX);

export const conversationToRoom = (conversationId: string, selfUsername: string) => {
  if (conversationId === GENERAL_ROOM) return GENERAL_ROOM;
  if (isGroupRoom(conversationId)) return conversationId;
  return dmRoomName(selfUsername, conversationId);
};

export const parseDmRoom = (room: string): [string, string] | null => {
  if (!room.startsWith("dm..")) return null;
  const parts = room.slice(4).split("..");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  return [parts[0], parts[1]];
};

export const dmPeerFromRoom = (room: string, selfUsername: string) => {
  const participants = parseDmRoom(room);
  if (!participants) return null;
  return participants[0] === selfUsername ? participants[1] : participants[1] === selfUsername ? participants[0] : null;
};

export const isDmConversation = (conversationId: string) =>
  conversationId !== GENERAL_ROOM && !isGroupRoom(conversationId);
