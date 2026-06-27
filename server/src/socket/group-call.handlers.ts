import type { Server, Socket } from "socket.io";
import { z } from "zod";
import { groupCallService } from "../services/groupCall.service.js";
import type { GroupCallState, SocketUser } from "../types/socket.js";
import { canAccessRoom } from "../services/roomAccess.service.js";
import { isValidRoom } from "../utils/room.js";

const callTypeSchema = z.enum(["audio", "video"]);
const roomSchema = z.object({ room: z.string().min(1).max(64) });
const startSchema = roomSchema.extend({ callType: callTypeSchema });
const relaySchema = roomSchema.extend({
  to: z.string().min(1).max(32),
});
const offerSchema = relaySchema.extend({ sdp: z.unknown() });
const answerSchema = relaySchema.extend({ sdp: z.unknown() });
const iceSchema = relaySchema.extend({ candidate: z.unknown() });

const findSocketByUsername = (io: Server, username: string): Socket | null => {
  for (const [, peer] of io.sockets.sockets) {
    if (peer.data.user?.username === username) return peer;
  }
  return null;
};

const relayToUser = (
  io: Server,
  from: SocketUser,
  to: string,
  event: string,
  payload: Record<string, unknown>,
): boolean => {
  const target = findSocketByUsername(io, to);
  if (!target) return false;
  target.emit(event, { from: from.username, ...payload });
  return true;
};

const emitGroupState = (io: Server, state: GroupCallState) => {
  io.to(state.room).emit("group-call:state", state);
};

const emitGroupEnded = (io: Server, room: string) => {
  io.to(room).emit("group-call:ended", { room });
};

export const registerGroupCallHandlers = (io: Server, socket: Socket, user: SocketUser): void => {
  socket.on("group-call:start", async (data: unknown) => {
    const parsed = startSchema.safeParse(data);
    if (!parsed.success || !isValidRoom(parsed.data.room) || !(await canAccessRoom(parsed.data.room, user.username))) {
      return;
    }
    if (!socket.rooms.has(parsed.data.room)) return;

    const state = groupCallService.start(parsed.data.room, user.username, parsed.data.callType);
    if (!state) return;
    emitGroupState(io, state);
  });

  socket.on("group-call:join", async (data: unknown) => {
    const parsed = roomSchema.safeParse(data);
    if (!parsed.success || !isValidRoom(parsed.data.room) || !(await canAccessRoom(parsed.data.room, user.username))) {
      return;
    }
    if (!socket.rooms.has(parsed.data.room)) return;

    const state = groupCallService.join(parsed.data.room, user.username);
    if (!state) return;
    emitGroupState(io, state);
  });

  socket.on("group-call:leave", (data: unknown) => {
    const parsed = roomSchema.safeParse(data);
    if (!parsed.success) return;

    const state = groupCallService.leave(parsed.data.room, user.username);
    if (!state) {
      emitGroupEnded(io, parsed.data.room);
      return;
    }
    emitGroupState(io, state);
  });

  socket.on("group-call:offer", async (data: unknown) => {
    const parsed = offerSchema.safeParse(data);
    if (!parsed.success || !(await canAccessRoom(parsed.data.room, user.username))) return;
    relayToUser(io, user, parsed.data.to, "group-call:offer", {
      room: parsed.data.room,
      sdp: parsed.data.sdp,
    });
  });

  socket.on("group-call:answer", async (data: unknown) => {
    const parsed = answerSchema.safeParse(data);
    if (!parsed.success || !(await canAccessRoom(parsed.data.room, user.username))) return;
    relayToUser(io, user, parsed.data.to, "group-call:answer", {
      room: parsed.data.room,
      sdp: parsed.data.sdp,
    });
  });

  socket.on("group-call:ice-candidate", async (data: unknown) => {
    const parsed = iceSchema.safeParse(data);
    if (!parsed.success || !(await canAccessRoom(parsed.data.room, user.username))) return;
    relayToUser(io, user, parsed.data.to, "group-call:ice-candidate", {
      room: parsed.data.room,
      candidate: parsed.data.candidate,
    });
  });

  socket.on("disconnect", () => {
    const updates = groupCallService.removeUserFromAll(user.username);
    for (const state of updates) {
      if (state.participants.length === 0) emitGroupEnded(io, state.room);
      else emitGroupState(io, state);
    }
  });
};
