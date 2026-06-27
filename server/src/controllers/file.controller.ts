import type { Request, Response } from "express";
import type { Server } from "socket.io";
import { fileService } from "../services/file.service.js";
import { streamObjectToResponse } from "../services/objectStorage.service.js";
import { messageService } from "../services/message.service.js";
import type { ApiErrorResponse, ChatMessageDto } from "../types/api.js";
import { canAccessRoom } from "../services/roomAccess.service.js";
import { HttpError } from "../utils/httpError.js";

export const uploadFile = async (
  req: Request,
  res: Response<ChatMessageDto | ApiErrorResponse>,
  io: Server,
): Promise<void> => {
  try {
    const room = req.params.room as string;
    if (!req.file || !req.user) {
      throw new HttpError(400, "No file uploaded");
    }
    if (!(await canAccessRoom(room, req.user.username))) {
      throw new HttpError(403, "Forbidden");
    }
    const sharedFile = await fileService.saveUploadedFile(room, req.user, req.file);
    const caption = typeof req.body?.caption === "string" ? req.body.caption : undefined;
    const message = await messageService.createFileMessage(room, req.user, sharedFile, caption);
    io.to(room).emit("message", message);
    res.status(201).json(message);
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw error;
  }
};

export const downloadFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const room = req.params.room as string;
    const id = req.params.id as string;
    if (!req.user || !(await canAccessRoom(room, req.user.username))) {
      throw new HttpError(403, "Forbidden");
    }
    const sharedFile = await fileService.getSharedFile(room, id);
    if (!sharedFile) {
      throw new HttpError(404, "File not found");
    }
    await streamObjectToResponse(res, sharedFile.storedName, { downloadName: sharedFile.originalName });
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw error;
  }
};
