import type { PresencePayload } from "../types/socket.js";

export class PresenceService {
  private readonly online = new Map<string, Set<string>>();

  join(room: string, username: string): PresencePayload {
    if (!this.online.has(room)) this.online.set(room, new Set());
    this.online.get(room)!.add(username);
    return this.getPresence(room);
  }

  leave(room: string, username: string): PresencePayload {
    this.online.get(room)?.delete(username);
    return this.getPresence(room);
  }

  getPresence(room: string): PresencePayload {
    const users = this.online.get(room);
    return { count: users?.size ?? 0, users: [...(users ?? [])] };
  }
}

export const presenceService = new PresenceService();
