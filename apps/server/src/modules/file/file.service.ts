import { buildFileObjectKey } from "./file.middleware.js";
import { objectStorage } from "../../shared/objectStorage.service.js";
import { SharedFile, type SharedFileDocument } from "./file.model.js";
import type { AuthUser } from "../../types/index.js";

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
