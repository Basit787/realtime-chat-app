import path from "node:path";
import type { Connection } from "mongoose";
import { objectStorage } from "../../shared/objectStorage.service.js";
import type { ContactDto } from "../../types/api.js";
import { ChatGroup } from "../group/group.model.js";
import { CallHistory } from "../call/call.model.js";
import { Message } from "../message/message.model.js";
import { parseDmRoom } from "../../utils/room.js";
import type { PresencePayload } from "../../types/socket.js";
import { UserPresence, type PresenceStatus } from "./user.model.js";

export const avatarPublicPath = (userId: string, version = Date.now()) => `/api/profile/avatars/${userId}?v=${version}`;

export const createAvatarService = (connection: Connection) => {
  const findUserIdByUsername = async (username: string): Promise<string | null> => {
    const escaped = username.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const db = connection.db;
    if (!db) return null;
    const user = await db.collection("user").findOne({ name: { $regex: new RegExp(`^${escaped}$`, "i") } });
    return user?._id?.toString() ?? null;
  };

  const findAvatarKey = async (userId: string): Promise<string | null> =>
    objectStorage.findFirstKey("avatars/", userId);

  const saveAvatar = async (userId: string, file: Express.Multer.File) => {
    const key = `avatars/${userId}${path.extname(file.originalname).toLowerCase() || ".jpg"}`;
    await objectStorage.deleteByPrefix(`avatars/${userId}`, key);
    await objectStorage.put(key, file.buffer, file.mimetype);
    return key;
  };

  const removeAvatar = async (userId: string) => {
    await objectStorage.deleteByPrefix(`avatars/${userId}`);
  };

  const getUserAvatarKey = async (username: string): Promise<string | null> => {
    const userId = await findUserIdByUsername(username);
    if (!userId) return null;
    return findAvatarKey(userId);
  };

  return {
    findUserIdByUsername,
    findAvatarKey,
    saveAvatar,
    removeAvatar,
    getUserAvatarKey,
  };
};

export type AvatarService = ReturnType<typeof createAvatarService>;

export const createContactsService = (connection: Connection) => {
  const getKnownContacts = async (username: string): Promise<string[]> => {
    const peers = new Set<string>();

    const dmMessages = await Message.find({ room: /^dm\.\./ })
      .select("room")
      .lean();
    for (const message of dmMessages) {
      const participants = parseDmRoom(message.room);
      if (!participants || !participants.includes(username)) continue;
      const peer = participants[0] === username ? participants[1] : participants[0];
      peers.add(peer);
    }

    const calls = await CallHistory.find({
      $or: [{ caller: username }, { callee: username }],
    })
      .select("caller callee")
      .lean();

    for (const call of calls) {
      peers.add(call.caller === username ? call.callee : call.caller);
    }

    const groups = await ChatGroup.find({ members: username }).select("members").lean();
    for (const group of groups) {
      for (const member of group.members) {
        if (member !== username) peers.add(member);
      }
    }

    const db = connection.db;
    if (db) {
      const allUsers = await db
        .collection("user")
        .find({}, { projection: { name: 1 } })
        .toArray();
      for (const user of allUsers) {
        const name = user.name as string | undefined;
        if (name && name !== username) peers.add(name);
      }
    }

    peers.delete(username);
    return [...peers].sort((a, b) => a.localeCompare(b));
  };

  const getKnownContactProfiles = async (username: string): Promise<ContactDto[]> => {
    const names = await getKnownContacts(username);
    if (names.length === 0) return [];

    const db = connection.db;
    if (!db) return [];

    const users = await db
      .collection("user")
      .find({ name: { $in: names } }, { projection: { name: 1, image: 1 } })
      .toArray();

    const imageByName = new Map<string, string>();
    for (const user of users) {
      const name = user.name as string | undefined;
      if (!name) continue;
      imageByName.set(name, (user.image as string | undefined) ?? "");
    }

    return names.map((name) => ({
      name,
      image: imageByName.get(name) ?? "",
    }));
  };

  return { getKnownContacts, getKnownContactProfiles };
};

export type ContactsService = ReturnType<typeof createContactsService>;

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
    await UserPresence.findOneAndUpdate({ username }, { status, updatedAt: new Date() }, { upsert: true, new: true });
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
