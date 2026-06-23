import path from "node:path";
import { config } from "../config/index.js";
import { SharedFile, type SharedFileDocument } from "../models/SharedFile.js";
import type { AuthUser } from "../types/index.js";

export class FileService {
  async saveUploadedFile(room: string, user: AuthUser, file: Express.Multer.File): Promise<SharedFileDocument> {
    return SharedFile.create({
      room,
      user: user.username,
      userId: user.id,
      originalName: file.originalname,
      mimeType: file.mimetype || "application/octet-stream",
      size: file.size,
      storedName: file.filename,
    });
  }

  async getSharedFile(room: string, id: string): Promise<SharedFileDocument | null> {
    return SharedFile.findOne({ _id: id, room });
  }

  getStoredPath(storedName: string): string {
    return path.join(config.uploadDir, storedName);
  }
}

export const fileService = new FileService();
