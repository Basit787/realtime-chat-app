import type { Role } from "./role.js";

export type CallType = "audio" | "video";

export interface SocketUser {
  id: string;
  role: Role;
  username: string;
}

export interface PresencePayload {
  room?: string;
  count: number;
  users: string[];
}

export interface TypingPayload {
  room: string;
  username: string;
}

export interface MessageDeletedPayload {
  id: string;
}

export interface CallIncomingPayload {
  from: string;
  callType: CallType;
}

export interface CallSignalPayload {
  from: string;
  sdp?: unknown;
  candidate?: unknown;
}

export interface CallFromPayload {
  from: string;
}

export interface CallInvitePayload {
  to: string;
  callType: CallType;
}

export interface CallRelayPayload {
  to: string;
}

export interface CallOfferPayload extends CallRelayPayload {
  sdp: unknown;
}

export interface CallAnswerPayload extends CallRelayPayload {
  sdp: unknown;
}

export interface CallIceCandidatePayload extends CallRelayPayload {
  candidate: unknown;
}
