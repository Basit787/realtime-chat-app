import path from "node:path";
import type { Connection } from "mongoose";
import { objectStorage } from "./objectStorage.service.js";

export const avatarPublicPath = (userId: string, version = Date.now()) =>
  `/api/profile/avatars/${userId}?v=${version}`;

export const createAvatarService = (connection: Connection) => {
  const findUserIdByUsername = async (username: string): Promise<string | null> => {
    const escaped = username.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const db = connection.db;
    if (!db) return null;
    const user = await db
      .collection("user")
      .findOne({ name: { $regex: new RegExp(`^${escaped}$`, "i") } });
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
