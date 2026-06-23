import fs from "node:fs";
import multer from "multer";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { config } from "../config/index.js";

const storage = multer.diskStorage({
  destination: config.uploadDir,
  filename: (_req, file, cb) => {
    cb(null, `${randomUUID()}${path.extname(file.originalname)}`);
  },
});

export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: config.maxFileSizeMb * 1024 * 1024 },
});

export async function ensureUploadDir() {
  await fs.promises.mkdir(config.uploadDir, { recursive: true });
}
