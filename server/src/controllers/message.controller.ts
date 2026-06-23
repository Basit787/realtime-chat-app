import type { Request, Response } from "express";
import type { Server } from "socket.io";
import { messageService } from "../services/message.service.js";
import type { MessagesResponse, OkResponse } from "../types/api.js";

export async function getMessages(req: Request, res: Response<MessagesResponse>): Promise<void> {
  const room = req.params.room as string;
  const messages = await messageService.getRoomMessages(room);
  res.json({ messages });
}

export async function deleteMessage(req: Request, res: Response<OkResponse>, io: Server): Promise<void> {
  const room = req.params.room as string;
  const id = req.params.id as string;
  await messageService.deleteMessage(id);
  io.to(room).emit("message_deleted", { id });
  res.json({ ok: true });
}
