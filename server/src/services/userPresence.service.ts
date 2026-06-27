import { UserPresence, type PresenceStatus } from "../models/UserPresence.js";

export type { PresenceStatus };

const cache = new Map<string, PresenceStatus>();

export const userPresenceService = {
  getStatus: async (username: string): Promise<PresenceStatus> => {
    const cached = cache.get(username);
    if (cached) return cached;

    const doc = await UserPresence.findOne({ username }).lean();
    const status = doc?.status ?? "online";
    cache.set(username, status);
    return status;
  },

  setStatus: async (username: string, status: PresenceStatus): Promise<PresenceStatus> => {
    await UserPresence.findOneAndUpdate(
      { username },
      { status, updatedAt: new Date() },
      { upsert: true, new: true },
    );
    cache.set(username, status);
    return status;
  },

  getStatuses: async (usernames: string[]): Promise<Record<string, PresenceStatus>> => {
    const unique = [...new Set(usernames)];
    const result: Record<string, PresenceStatus> = {};

    const missing: string[] = [];
    for (const username of unique) {
      const cached = cache.get(username);
      if (cached) {
        result[username] = cached;
      } else {
        missing.push(username);
      }
    }

    if (missing.length > 0) {
      const docs = await UserPresence.find({ username: { $in: missing } }).lean();
      const byName = new Map(docs.map((doc) => [doc.username, doc.status]));
      for (const username of missing) {
        const status = byName.get(username) ?? "online";
        cache.set(username, status);
        result[username] = status;
      }
    }

    return result;
  },

  clearCache: (username: string) => {
    cache.delete(username);
  },
};
