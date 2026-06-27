import type { PresencePayload } from "../types/socket.js";
import type { PresenceStatus } from "../models/UserPresence.js";

const online = new Map<string, Set<string>>();

const getPresence = (room: string, statuses: Record<string, PresenceStatus> = {}): PresencePayload => {
  const users = [...(online.get(room) ?? [])];
  const roomStatuses: Record<string, PresenceStatus> = {};
  for (const username of users) {
    roomStatuses[username] = statuses[username] ?? "online";
  }
  return { count: users.length, users, statuses: roomStatuses };
};

export const presenceService = {
  join: (room: string, username: string): PresencePayload => {
    if (!online.has(room)) online.set(room, new Set());
    online.get(room)!.add(username);
    return getPresence(room);
  },

  leave: (room: string, username: string): PresencePayload => {
    online.get(room)?.delete(username);
    return getPresence(room);
  },

  getPresence,
};
