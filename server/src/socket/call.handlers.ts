import type { Server, Socket } from "socket.io";
import { z } from "zod";
import { callHistoryService } from "../services/callHistory.service.js";
import type { CallHistoryDto } from "../types/api.js";
import type { SocketUser } from "../types/socket.js";

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
    relayToUser(io, user, parsed.data.to, "call:incoming", {
      callType: parsed.data.callType,
    });
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
