import multer from "multer";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { config } from "../config/index.js";

export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.maxFileSizeMb * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    file.originalname = path.basename(file.originalname);
    cb(null, true);
  },
});

export const buildFileObjectKey = (originalName: string) => {
  const ext = path.extname(originalName);
  return `files/${randomUUID()}${ext}`;
};
