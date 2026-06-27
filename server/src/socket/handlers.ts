import type { Server, Socket } from "socket.io";
import { z } from "zod";
import { messageService } from "../services/message.service.js";
import { presenceService } from "../services/presence.service.js";
import { userPresenceService } from "../services/userPresence.service.js";
import type { ChatMessageDto } from "../types/api.js";
import type { TypingPayload } from "../types/socket.js";
import { canAccessRoom } from "../services/roomAccess.service.js";
import { isValidRoom } from "../utils/room.js";
import { messageTextSchema } from "../validators/message.validator.js";
import { registerCallHandlers } from "./call.handlers.js";
import { registerGroupCallHandlers } from "./group-call.handlers.js";

const GENERAL_ROOM = "general";

const roomPayloadSchema = z.object({
  room: z.string().min(1).max(64),
});

const messagePayloadSchema = z.object({
  room: z.string().min(1).max(64),
  text: messageTextSchema,
});

const statusPayloadSchema = z.object({
  status: z.enum(["online", "away", "busy", "offline"]),
});

const emitPresence = async (io: Server, room: string) => {
  const base = presenceService.getPresence(room);
  const statuses = await userPresenceService.getStatuses(base.users);
  io.to(room).emit("presence", { room, ...presenceService.getPresence(room, statuses) });
};

export const registerSocketHandlers = (io: Server): void => {
  io.on("connection", async (socket: Socket) => {
    const user = socket.data.user;

    socket.join(GENERAL_ROOM);
    presenceService.join(GENERAL_ROOM, user.username);
    await emitPresence(io, GENERAL_ROOM);

    registerCallHandlers(io, socket, user);
    registerGroupCallHandlers(io, socket, user);

    socket.on("status:set", async (data: unknown) => {
      const parsed = statusPayloadSchema.safeParse(data);
      if (!parsed.success) return;

      await userPresenceService.setStatus(user.username, parsed.data.status);
      await emitPresence(io, GENERAL_ROOM);
    });

    socket.on("room:join", async (data: unknown) => {
      const parsed = roomPayloadSchema.safeParse(data);
      if (!parsed.success || !isValidRoom(parsed.data.room) || !(await canAccessRoom(parsed.data.room, user.username))) {
        return;
      }
      socket.join(parsed.data.room);
    });

    socket.on("room:leave", (data: unknown) => {
      const parsed = roomPayloadSchema.safeParse(data);
      if (!parsed.success || parsed.data.room === GENERAL_ROOM) return;
      socket.leave(parsed.data.room);
    });

    socket.on("typing", (data: unknown) => {
      const parsed = roomPayloadSchema.safeParse(data);
      if (!parsed.success || !socket.rooms.has(parsed.data.room)) return;
      const payload: TypingPayload = { room: parsed.data.room, username: user.username };
      socket.to(parsed.data.room).emit("typing", payload);
    });

    socket.on("message", async (data: unknown) => {
      const parsed = messagePayloadSchema.safeParse(data);
      if (!parsed.success || !isValidRoom(parsed.data.room) || !(await canAccessRoom(parsed.data.room, user.username))) {
        return;
      }
      if (!socket.rooms.has(parsed.data.room)) return;

      const message: ChatMessageDto = await messageService.createMessage(
        parsed.data.room,
        user.id,
        user.username,
        parsed.data.text,
      );
      io.to(parsed.data.room).emit("message", message);
    });

    socket.on("disconnect", async () => {
      for (const room of socket.rooms) {
        if (room === socket.id || !isValidRoom(room)) continue;
        presenceService.leave(room, user.username);
        await emitPresence(io, room);
      }
    });
  });
}
