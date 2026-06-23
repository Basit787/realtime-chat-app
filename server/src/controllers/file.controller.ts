import type { Request, Response } from "express";
import type { Server } from "socket.io";
import { fileService } from "../services/file.service.js";
import { messageService } from "../services/message.service.js";
import type { ApiErrorResponse, ChatMessageDto } from "../types/api.js";

export async function uploadFile(
  req: Request,
  res: Response<ChatMessageDto | ApiErrorResponse>,
  io: Server,
): Promise<void> {
  const room = req.params.room as string;
  if (!req.file || !req.user) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }
  const sharedFile = await fileService.saveUploadedFile(room, req.user, req.file);
  const caption = typeof req.body?.caption === "string" ? req.body.caption : undefined;
  const message = await messageService.createFileMessage(room, req.user, sharedFile, caption);
  io.to(room).emit("message", message);
  res.status(201).json(message);
}

export async function downloadFile(req: Request, res: Response): Promise<void> {
  const room = req.params.room as string;
  const id = req.params.id as string;
  const sharedFile = await fileService.getSharedFile(room, id);
  if (!sharedFile) {
    res.status(404).json({ error: "File not found" });
    return;
  }
  const filePath = fileService.getStoredPath(sharedFile.storedName);
  res.download(filePath, sharedFile.originalName);
}
