import type { Server, Socket } from "socket.io";
import { z } from "zod";
import { callHistoryService, groupCallService } from "./call.service.js";
import { groupService } from "../group/group.service.js";
import type { CallHistoryDto } from "../../types/api.js";
import type { GroupCallState, SocketUser } from "../../types/socket.js";
import { canAccessRoom } from "../../shared/roomAccess.service.js";
import { isValidRoom, MAX_ROOM_LENGTH } from "../../utils/room.js";
import { userRoom } from "../../socket/roomEmit.js";

const callTypeSchema = z.enum(["audio", "video"]);
const signalTargetSchema = z.object({ to: z.string().min(1).max(32) });
const offerSchema = signalTargetSchema.extend({ sdp: z.unknown() });
const answerSchema = signalTargetSchema.extend({ sdp: z.unknown() });
const iceSchema = signalTargetSchema.extend({ candidate: z.unknown() });
const inviteSchema = signalTargetSchema.extend({ callType: callTypeSchema });

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

const broadcastCallHistory = (io: Server, caller: string, callee: string, entry: CallHistoryDto) => {
  for (const username of [caller, callee]) {
    const target = findSocketByUsername(io, username);
    target?.emit("call:history", entry);
  }
};

export const registerCallHandlers = (io: Server, socket: Socket, user: SocketUser): void => {
  socket.on("call:invite", (data: unknown) => {
    const parsed = inviteSchema.safeParse(data);
    if (!parsed.success || parsed.data.to === user.username) return;
    callHistoryService.trackInvite(user.username, parsed.data.to, parsed.data.callType);
    const delivered = relayToUser(io, user, parsed.data.to, "call:incoming", {
      callType: parsed.data.callType,
    });
    // Lets the caller show "Ringing" (callee's app got the call) instead of "Calling…"
    if (delivered) socket.emit("call:ringing", { from: parsed.data.to });
  });

  socket.on("call:offer", (data: unknown) => {
    const parsed = offerSchema.safeParse(data);
    if (!parsed.success) return;
    relayToUser(io, user, parsed.data.to, "call:offer", { sdp: parsed.data.sdp });
  });

  socket.on("call:answer", (data: unknown) => {
    const parsed = answerSchema.safeParse(data);
    if (!parsed.success) return;
    callHistoryService.trackAnswer(parsed.data.to, user.username);
    relayToUser(io, user, parsed.data.to, "call:answer", { sdp: parsed.data.sdp });
  });

  socket.on("call:ice-candidate", (data: unknown) => {
    const parsed = iceSchema.safeParse(data);
    if (!parsed.success) return;
    relayToUser(io, user, parsed.data.to, "call:ice-candidate", { candidate: parsed.data.candidate });
  });

  socket.on("call:end", (data: unknown) => {
    const parsed = signalTargetSchema.safeParse(data);
    if (!parsed.success) return;
    relayToUser(io, user, parsed.data.to, "call:end", {});
    void callHistoryService.recordEnd(user.username, parsed.data.to).then((entry) => {
      if (entry) broadcastCallHistory(io, entry.caller, entry.callee, entry);
    });
  });

  socket.on("call:reject", (data: unknown) => {
    const parsed = signalTargetSchema.safeParse(data);
    if (!parsed.success) return;
    relayToUser(io, user, parsed.data.to, "call:reject", {});
    void callHistoryService.recordReject(parsed.data.to, user.username).then((entry) => {
      if (entry) broadcastCallHistory(io, entry.caller, entry.callee, entry);
    });
  });
};

// Group calls (mesh signaling within a group room)
const roomSchema = z.object({ room: z.string().min(1).max(MAX_ROOM_LENGTH) });
const startSchema = roomSchema.extend({ callType: callTypeSchema });
const relaySchema = roomSchema.extend({
  to: z.string().min(1).max(32),
});
const groupOfferSchema = relaySchema.extend({ sdp: z.unknown() });
const groupAnswerSchema = relaySchema.extend({ sdp: z.unknown() });
const groupIceSchema = relaySchema.extend({ candidate: z.unknown() });

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
    const parsed = groupOfferSchema.safeParse(data);
    if (!parsed.success || !(await canAccessRoom(parsed.data.room, user.username))) return;
    relayToUser(io, user, parsed.data.to, "group-call:offer", {
      room: parsed.data.room,
      sdp: parsed.data.sdp,
    });
  });

  socket.on("group-call:answer", async (data: unknown) => {
    const parsed = groupAnswerSchema.safeParse(data);
    if (!parsed.success || !(await canAccessRoom(parsed.data.room, user.username))) return;
    relayToUser(io, user, parsed.data.to, "group-call:answer", {
      room: parsed.data.room,
      sdp: parsed.data.sdp,
    });
  });

  socket.on("group-call:ice-candidate", async (data: unknown) => {
    const parsed = groupIceSchema.safeParse(data);
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
