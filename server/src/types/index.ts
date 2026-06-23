import type { Role } from "./role.js";

export type { Role } from "./role.js";
export { ROLES } from "./role.js";

export interface AuthUser {
  id: string;
  role: Role;
  username: string;
}

export type { AppConfig } from "./config.js";
export type {
  ApiErrorResponse,
  ChatMessageDto,
  IceServerDto,
  MessageFileDto,
  MessagesResponse,
  MessageType,
  OkResponse,
  WebRTCConfigResponse,
} from "./api.js";
export type {
  CallAnswerPayload,
  CallFromPayload,
  CallIceCandidatePayload,
  CallIncomingPayload,
  CallInvitePayload,
  CallOfferPayload,
  CallRelayPayload,
  CallSignalPayload,
  CallType,
  MessageDeletedPayload,
  PresencePayload,
  SocketUser,
  TypingPayload,
} from "./socket.js";
