const ROOM_PATTERN = /^[a-zA-Z0-9._-]{1,64}$/;
const DM_PREFIX = "dm..";
const GROUP_PREFIX = "group..";

export const isValidRoom = (room: string) => ROOM_PATTERN.test(room);

export const groupRoomName = (groupId: string) => `${GROUP_PREFIX}${groupId}`;

export const parseGroupRoom = (room: string): string | null => {
  if (!room.startsWith(GROUP_PREFIX)) return null;
  const id = room.slice(GROUP_PREFIX.length);
  return id && ROOM_PATTERN.test(id) ? id : null;
};

export const isGroupRoom = (room: string) => room.startsWith(GROUP_PREFIX);

export const dmRoomName = (userA: string, userB: string) => {
  const [a, b] = [userA, userB].sort();
  return `${DM_PREFIX}${a}..${b}`;
};

export const parseDmRoom = (room: string): [string, string] | null => {
  if (!room.startsWith(DM_PREFIX)) return null;
  const parts = room.slice(DM_PREFIX.length).split("..");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  return [parts[0], parts[1]];
};

export const canAccessRoom = (room: string, username: string) => {
  if (room === "general") return true;
  const participants = parseDmRoom(room);
  if (!participants) return false;
  return participants.includes(username);
};

export const dmPeerFromRoom = (room: string, selfUsername: string) => {
  const participants = parseDmRoom(room);
  if (!participants) return null;
  return participants[0] === selfUsername ? participants[1] : participants[1] === selfUsername ? participants[0] : null;
};
