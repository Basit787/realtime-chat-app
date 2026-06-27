import type { Request, Response } from "express";
import type { Server } from "socket.io";
import { messageService } from "../services/message.service.js";
import type { ApiErrorResponse, MessagesResponse, OkResponse } from "../types/api.js";
import { ROLES } from "../types/role.js";
import { canAccessRoom } from "../services/roomAccess.service.js";
import { HttpError } from "../utils/httpError.js";

export const getMessages = async (req: Request, res: Response<MessagesResponse>): Promise<void> => {
  try {
    const room = req.params.room as string;
    const username = req.user!.username;

    if (!(await canAccessRoom(room, username))) {
      throw new HttpError(403, "Forbidden");
    }

    const messages = await messageService.getRoomMessages(room);
    res.json({ messages });
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw error;
  }
};

export const deleteMessage = async (
  req: Request,
  res: Response<OkResponse | ApiErrorResponse>,
  io: Server,
): Promise<void> => {
  try {
    const room = req.params.room as string;
    const id = req.params.id as string;
    const user = req.user!;

    if (!(await canAccessRoom(room, user.username))) {
      throw new HttpError(403, "Forbidden");
    }

    const message = await messageService.getMessageById(id);
    if (!message || message.room !== room) {
      throw new HttpError(404, "Message not found");
    }

    if (message.deleted) {
      throw new HttpError(400, "Message already deleted");
    }

    const isOwner = message.user === user.username;
    const isAdmin = user.role === ROLES.ADMIN;
    if (!isOwner && !isAdmin) {
      throw new HttpError(403, "Forbidden");
    }

    const updated = await messageService.deleteMessage(id);
    if (!updated) {
      throw new HttpError(404, "Message not found");
    }

    io.to(room).emit("message_deleted", updated);
    res.json({ ok: true });
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw error;
  }
};
