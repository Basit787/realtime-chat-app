import { buildFileObjectKey } from "../middleware/upload.js";
import { objectStorage } from "./objectStorage.service.js";
import { SharedFile, type SharedFileDocument } from "../models/SharedFile.js";
import type { AuthUser } from "../types/index.js";

const saveUploadedFile = async (
  room: string,
  user: AuthUser,
  file: Express.Multer.File,
): Promise<SharedFileDocument> => {
  const storedName = buildFileObjectKey(file.originalname);
  await objectStorage.put(storedName, file.buffer, file.mimetype || "application/octet-stream");

  return SharedFile.create({
    room,
    user: user.username,
    userId: user.id,
    originalName: file.originalname,
    mimeType: file.mimetype || "application/octet-stream",
    size: file.size,
    storedName,
  });
};

const getSharedFile = async (room: string, id: string): Promise<SharedFileDocument | null> =>
  SharedFile.findOne({ _id: id, room });

export const fileService = {
  saveUploadedFile,
  getSharedFile,
};
