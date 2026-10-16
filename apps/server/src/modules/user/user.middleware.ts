import type { Request } from "express";
import { createUploadMiddleware, entityObjectKey } from "@chat/backend-common";

const MAX_AVATAR_SIZE_MB = 5;

export const avatarUploadMiddleware = createUploadMiddleware({ maxFileSizeMb: MAX_AVATAR_SIZE_MB, imagesOnly: true });

export const avatarObjectKey = (userId: string, originalName: string) => entityObjectKey("avatars", userId, originalName);

export const avatarPrefix = (userId: string) => `avatars/${userId}`;

export const avatarObjectKeyFromRequest = (req: Request, originalName: string) => {
  const userId = req.user?.id;
  if (!userId) throw new Error("Authentication required");
  return avatarObjectKey(userId, originalName);
};
