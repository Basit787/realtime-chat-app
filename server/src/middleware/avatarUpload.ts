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

export const avatarUploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_AVATAR_SIZE_MB * 1024 * 1024 },
  fileFilter: imageFilter,
});

export const avatarObjectKey = (userId: string, originalName: string) => {
  const ext = path.extname(originalName).toLowerCase() || ".jpg";
  return `avatars/${userId}${ext}`;
};

export const avatarPrefix = (userId: string) => `avatars/${userId}`;

export const avatarObjectKeyFromRequest = (req: Request, originalName: string) => {
  const userId = req.user?.id;
  if (!userId) throw new Error("Authentication required");
  return avatarObjectKey(userId, originalName);
}
