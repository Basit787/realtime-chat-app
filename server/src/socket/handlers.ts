import type { Server, Socket } from "socket.io";
import { messageService } from "../services/message.service.js";
import { presenceService } from "../services/presence.service.js";
import type { ChatMessageDto } from "../types/api.js";
import type { TypingPayload } from "../types/socket.js";
import { isValidRoom } from "../utils/room.js";
import { messageTextSchema } from "../validators/message.validator.js";
import { registerCallHandlers } from "./call.handlers.js";

function getRoom(socket: Socket): string {
  return (socket.handshake.query.room as string) || "general";
}

export function registerSocketHandlers(io: Server): void {
  io.on("connection", (socket: Socket) => {
    const user = socket.data.user;
    const room = getRoom(socket);

    if (!isValidRoom(room)) {
      socket.disconnect();
      return;
    }

    socket.join(room);
    const presence = presenceService.join(room, user.username);
    io.to(room).emit("presence", presence);

    registerCallHandlers(io, socket, room, user);

    socket.on("typing", () => {
      const payload: TypingPayload = { username: user.username };
      socket.to(room).emit("typing", payload);
    });

    socket.on("message", async (text: string) => {
      const parsed = messageTextSchema.safeParse(text?.trim());
      if (!parsed.success) return;
      const message: ChatMessageDto = await messageService.createMessage(room, user.id, user.username, parsed.data);
      io.to(room).emit("message", message);
    });

    socket.on("disconnect", () => {
      const updated = presenceService.leave(room, user.username);
      io.to(room).emit("presence", updated);
    });
  });
}
