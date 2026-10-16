import type { Server, Socket } from "socket.io";
import { z } from "zod";
import { messageService, type StatusUpdate } from "../modules/message/message.service.js";
import { groupService } from "../modules/group/group.service.js";
import { groupCallService } from "../modules/call/call.service.js";
import { presenceService, userPresenceService } from "../modules/user/user.service.js";
import type { ChatMessageDto } from "../types/api.js";
import type { TypingPayload } from "../types/socket.js";
import { canAccessRoom } from "../shared/roomAccess.service.js";
import { isValidRoom, MAX_ROOM_LENGTH, dmRoomsMatch } from "../utils/room.js";
import { messageTextSchema } from "../modules/message/message.validator.js";
import { registerCallHandlers, registerGroupCallHandlers } from "../modules/call/call.handlers.js";
import { emitToRoomParticipants, userRoom } from "./roomEmit.js";

const GENERAL_ROOM = "general";

const roomPayloadSchema = z.object({
  room: z.string().min(1).max(MAX_ROOM_LENGTH),
});

const messagePayloadSchema = z.object({
  room: z.string().min(1).max(MAX_ROOM_LENGTH),
  text: messageTextSchema,
});

const receiptPayloadSchema = z.object({
  room: z.string().min(1).max(MAX_ROOM_LENGTH),
  messageId: z.string().min(1),
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
    socket.join(userRoom(user.username));
    presenceService.join(GENERAL_ROOM, user.username);
    await emitPresence(io, GENERAL_ROOM);

    registerCallHandlers(io, socket, user);
    registerGroupCallHandlers(io, socket, user);

    const groups = await groupService.listForUser(user.username);
    for (const group of groups) {
      const state = groupCallService.get(group.room);
      if (state) socket.emit("group-call:state", state);
    }

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
      await emitToRoomParticipants(io, parsed.data.room, "message", message);
    });

    /** A receipt target: someone else's live message in a room this user can access, or null. */
    const findReceiptMessage = async (data: unknown) => {
      const parsed = receiptPayloadSchema.safeParse(data);
      if (!parsed.success || !isValidRoom(parsed.data.room) || !(await canAccessRoom(parsed.data.room, user.username))) {
        return null;
      }
      const message = await messageService.getMessageById(parsed.data.messageId);
      if (!message || !dmRoomsMatch(message.room, parsed.data.room) || message.user === user.username || message.deleted) {
        return null;
      }
      return message;
    };

    const emitStatus = ({ sender, messageId, status }: StatusUpdate) =>
      io.to(userRoom(sender)).emit("message:status", { messageId, status });

    socket.on("message:ack", async (data: unknown) => {
      const message = await findReceiptMessage(data);
      if (message) emitStatus(await messageService.markDelivered(message, user.username));
    });

    socket.on("room:read", async (data: unknown) => {
      const message = await findReceiptMessage(data);
      // Everything up to the newest seen message counts as read, not just that one message
      if (message) (await messageService.markRoomRead(message.room, message.at, user.username)).forEach(emitStatus);
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
