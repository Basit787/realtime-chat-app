export const GENERAL_ROOM = "general";

export function dmRoomName(userA: string, userB: string) {
  const [a, b] = [userA, userB].sort();
  return `dm..${a}..${b}`;
}

export function conversationToRoom(conversationId: string, selfUsername: string) {
  if (conversationId === GENERAL_ROOM) return GENERAL_ROOM;
  return dmRoomName(selfUsername, conversationId);
}

export function parseDmRoom(room: string): [string, string] | null {
  if (!room.startsWith("dm..")) return null;
  const parts = room.slice(4).split("..");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  return [parts[0], parts[1]];
}

export function dmPeerFromRoom(room: string, selfUsername: string) {
  const participants = parseDmRoom(room);
  if (!participants) return null;
  return participants[0] === selfUsername ? participants[1] : participants[1] === selfUsername ? participants[0] : null;
}

export function isDmConversation(conversationId: string) {
  return conversationId !== GENERAL_ROOM;
}
