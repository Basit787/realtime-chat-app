import multer from "multer";
import path from "node:path";
import type { Request } from "express";

const MAX_AVATAR_SIZE_MB = 5;

const imageFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
    return;
  }
  cb(new Error("Only image files are allowed"));
};

export const groupAvatarUploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_AVATAR_SIZE_MB * 1024 * 1024 },
  fileFilter: imageFilter,
});

export const groupAvatarObjectKey = (groupId: string, originalName: string) => {
  const ext = path.extname(originalName).toLowerCase() || ".jpg";
  return `group-avatars/${groupId}${ext}`;
};

export const groupAvatarPrefix = (groupId: string) => `group-avatars/${groupId}`;

export const groupAvatarObjectKeyFromRequest = (req: Request, originalName: string) => {
  const groupId = req.params.groupId as string | undefined;
  if (!groupId) throw new Error("Group id is required");
  return groupAvatarObjectKey(groupId, originalName);
}
