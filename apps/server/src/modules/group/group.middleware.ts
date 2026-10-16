import type { Request } from "express";
import { createUploadMiddleware, entityObjectKey } from "@chat/backend-common";

const MAX_AVATAR_SIZE_MB = 5;

export const groupAvatarUploadMiddleware = createUploadMiddleware({ maxFileSizeMb: MAX_AVATAR_SIZE_MB, imagesOnly: true });

export const groupAvatarObjectKey = (groupId: string, originalName: string) => entityObjectKey("group-avatars", groupId, originalName);

export const groupAvatarPrefix = (groupId: string) => `group-avatars/${groupId}`;

export const groupAvatarObjectKeyFromRequest = (req: Request, originalName: string) => {
  const groupId = req.params.groupId as string | undefined;
  if (!groupId) throw new Error("Group id is required");
  return groupAvatarObjectKey(groupId, originalName);
};
