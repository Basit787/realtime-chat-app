import type { Server, Socket } from "socket.io";
import { z } from "zod";
import { groupCallService } from "../services/groupCall.service.js";
import { groupService } from "../services/group.service.js";
import type { GroupCallState, SocketUser } from "../types/socket.js";
import { canAccessRoom } from "../services/roomAccess.service.js";
import { isValidRoom, MAX_ROOM_LENGTH } from "../utils/room.js";
import { userRoom } from "./roomEmit.js";

const callTypeSchema = z.enum(["audio", "video"]);
const roomSchema = z.object({ room: z.string().min(1).max(MAX_ROOM_LENGTH) });
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

const emitGroupIncoming = async (io: Server, state: GroupCallState) => {
  const members = await groupService.getMembersForRoom(state.room);
  if (!members) return;
  for (const member of members) {
    if (state.participants.includes(member)) continue;
    io.to(userRoom(member)).emit("group-call:incoming", state);
  }
};

const emitGroupState = async (io: Server, state: GroupCallState) => {
  const members = await groupService.getMembersForRoom(state.room);
  if (!members) return;
  for (const member of members) {
    io.to(userRoom(member)).emit("group-call:state", state);
  }
};

const emitGroupEnded = async (io: Server, room: string) => {
  const members = await groupService.getMembersForRoom(room);
  if (!members) return;
  for (const member of members) {
    io.to(userRoom(member)).emit("group-call:ended", { room });
  }
};

export const registerGroupCallHandlers = (io: Server, socket: Socket, user: SocketUser): void => {
  socket.on("group-call:start", async (data: unknown) => {
    const parsed = startSchema.safeParse(data);
    if (!parsed.success || !isValidRoom(parsed.data.room) || !(await canAccessRoom(parsed.data.room, user.username))) {
      return;
    }

    const state = groupCallService.start(parsed.data.room, user.username, parsed.data.callType);
    if (!state) return;
    await emitGroupIncoming(io, state);
    await emitGroupState(io, state);
  });

  socket.on("group-call:join", async (data: unknown) => {
    const parsed = roomSchema.safeParse(data);
    if (!parsed.success || !isValidRoom(parsed.data.room) || !(await canAccessRoom(parsed.data.room, user.username))) {
      return;
    }

    const state = groupCallService.join(parsed.data.room, user.username);
    if (!state) return;
    await emitGroupState(io, state);
  });

  socket.on("group-call:leave", (data: unknown) => {
    const parsed = roomSchema.safeParse(data);
    if (!parsed.success) return;

    const state = groupCallService.leave(parsed.data.room, user.username);
    if (!state) {
      void emitGroupEnded(io, parsed.data.room);
      return;
    }
    void emitGroupState(io, state);
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
      if (state.participants.length === 0) void emitGroupEnded(io, state.room);
      else void emitGroupState(io, state);
    }
  });
};
