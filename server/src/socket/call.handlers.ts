import type { Server, Socket } from "socket.io";
import { z } from "zod";
import type { SocketUser } from "../types/socket.js";

const callTypeSchema = z.enum(["audio", "video"]);
const signalTargetSchema = z.object({ to: z.string().min(1).max(32) });
const offerSchema = signalTargetSchema.extend({ sdp: z.unknown() });
const answerSchema = signalTargetSchema.extend({ sdp: z.unknown() });
const iceSchema = signalTargetSchema.extend({ candidate: z.unknown() });
const inviteSchema = signalTargetSchema.extend({ callType: callTypeSchema });

function findSocketByUsername(io: Server, room: string, username: string): Socket | null {
  for (const [, peer] of io.sockets.sockets) {
    if (peer.data.user?.username === username && peer.rooms.has(room)) return peer;
  }
  return null;
}

function relayToUser(
  io: Server,
  room: string,
  from: SocketUser,
  to: string,
  event: string,
  payload: Record<string, unknown>,
): boolean {
  const target = findSocketByUsername(io, room, to);
  if (!target) return false;
  target.emit(event, { from: from.username, ...payload });
  return true;
}

export function registerCallHandlers(io: Server, socket: Socket, room: string, user: SocketUser): void {
  socket.on("call:invite", (data: unknown) => {
    const parsed = inviteSchema.safeParse(data);
    if (!parsed.success || parsed.data.to === user.username) return;
    relayToUser(io, room, user, parsed.data.to, "call:incoming", {
      callType: parsed.data.callType,
    });
  });

  socket.on("call:offer", (data: unknown) => {
    const parsed = offerSchema.safeParse(data);
    if (!parsed.success) return;
    relayToUser(io, room, user, parsed.data.to, "call:offer", { sdp: parsed.data.sdp });
  });

  socket.on("call:answer", (data: unknown) => {
    const parsed = answerSchema.safeParse(data);
    if (!parsed.success) return;
    relayToUser(io, room, user, parsed.data.to, "call:answer", { sdp: parsed.data.sdp });
  });

  socket.on("call:ice-candidate", (data: unknown) => {
    const parsed = iceSchema.safeParse(data);
    if (!parsed.success) return;
    relayToUser(io, room, user, parsed.data.to, "call:ice-candidate", { candidate: parsed.data.candidate });
  });

  socket.on("call:end", (data: unknown) => {
    const parsed = signalTargetSchema.safeParse(data);
    if (!parsed.success) return;
    relayToUser(io, room, user, parsed.data.to, "call:end", {});
  });

  socket.on("call:reject", (data: unknown) => {
    const parsed = signalTargetSchema.safeParse(data);
    if (!parsed.success) return;
    relayToUser(io, room, user, parsed.data.to, "call:reject", {});
  });
}
