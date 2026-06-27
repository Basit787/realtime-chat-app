import path from "node:path";
import { objectStorage } from "./objectStorage.service.js";

export const groupAvatarPublicPath = (groupId: string, version = Date.now()) =>
  `/api/groups/${groupId}/avatar?v=${version}`;

export const findGroupAvatarKey = async (groupId: string): Promise<string | null> =>
  objectStorage.findFirstKey("group-avatars/", groupId);

export const saveGroupAvatar = async (groupId: string, file: Express.Multer.File) => {
  const key = `group-avatars/${groupId}${path.extname(file.originalname).toLowerCase() || ".jpg"}`;
  await objectStorage.deleteByPrefix(`group-avatars/${groupId}`, key);
  await objectStorage.put(key, file.buffer, file.mimetype);
  return key;
};

export const removeGroupAvatarFiles = async (groupId: string) => {
  await objectStorage.deleteByPrefix(`group-avatars/${groupId}`);
};
