import type { Types } from "mongoose";
import { Message } from "./message.model.js";
import type { ChatMessageDto, MessageDeliveryStatus, MessageFileDto } from "../../types/api.js";
import type { AuthUser } from "../../types/index.js";
import type { SharedFileDocument } from "../file/file.model.js";
import { dmRoomAliases, parseDmRoom } from "../../utils/room.js";
import { groupService } from "../group/group.service.js";

const dmRoomsToQuery = (room: string): string[] => {
  const participants = parseDmRoom(room);
  if (!participants) return [room];
  return dmRoomAliases(participants[0], participants[1]);
};

/** Everyone expected to receive messages in a room, or null when membership is open (the General channel). */
const roomRecipients = async (room: string): Promise<string[] | null> => {
  const dmParticipants = parseDmRoom(room);
  if (dmParticipants) return dmParticipants;
  return groupService.getMembersForRoom(room);
};

const deliveryStatus = (
  message: { user: string; deliveredTo?: string[]; readBy?: string[] },
  recipients: string[] | null,
): MessageDeliveryStatus => {
  const readBy = message.readBy ?? [];
  const deliveredTo = message.deliveredTo ?? [];

  // Open channel: no fixed audience, so any reader/receiver counts
  if (!recipients) {
    if (readBy.length > 0) return "read";
    return deliveredTo.length > 0 ? "delivered" : "sent";
  }

  const others = recipients.filter((u) => u !== message.user);
  if (others.length === 0) return "sent";
  if (others.every((u) => readBy.includes(u))) return "read";
  if (others.every((u) => readBy.includes(u) || deliveredTo.includes(u))) return "delivered";
  return "sent";
};

const toMessagePayload = (message: {
  id: string;
  room: string;
  user: string;
  text: string;
  type?: "text" | "file";
  file?: MessageFileDto;
  deleted?: boolean;
  at: Date;
}): ChatMessageDto => {
  const deleted = message.deleted ?? false;
  return {
    id: message.id,
    room: message.room,
    user: message.user,
    text: deleted ? "" : message.text,
    type: deleted ? "text" : (message.type ?? "text"),
    file: deleted ? undefined : message.file,
    deleted,
    at: message.at.toISOString(),
  };
};

const getRoomMessages = async (room: string, viewer: string): Promise<ChatMessageDto[]> => {
  const rooms = dmRoomsToQuery(room);
  const [messages, recipients] = await Promise.all([
    Message.find({ room: { $in: rooms } }).sort({ at: 1 }).limit(200).lean(),
    roomRecipients(room),
  ]);
  return messages.map((message) => ({
    ...toMessagePayload({
      id: message._id.toString(),
      room: message.room,
      user: message.user,
      text: message.text,
      type: message.type,
      file: message.file,
      deleted: message.deleted,
      at: message.at,
    }),
    ...(message.user === viewer ? { status: deliveryStatus(message, recipients) } : {}),
  }));
};

export type StatusUpdate = { messageId: string; sender: string; status: MessageDeliveryStatus };

type ReceiptFields = { _id: Types.ObjectId; room: string; user: string; deliveredTo?: string[]; readBy?: string[] };

/** Record that `username` received `message`; returns the sender's new status for it. */
const markDelivered = async (message: ReceiptFields, username: string): Promise<StatusUpdate> => {
  const [, recipients] = await Promise.all([
    Message.updateOne({ _id: message._id }, { $addToSet: { deliveredTo: username } }),
    roomRecipients(message.room),
  ]);
  const deliveredTo = [...(message.deliveredTo ?? []), username];
  const status = deliveryStatus({ ...message, deliveredTo }, recipients);
  return { messageId: message._id.toString(), sender: message.user, status };
};

/** Mark every message in the room sent up to `upTo` as read by `reader`; returns each changed message's status. */
const markRoomRead = async (room: string, upTo: Date, reader: string): Promise<StatusUpdate[]> => {
  const unread = await Message.find({
    room: { $in: dmRoomsToQuery(room) },
    user: { $ne: reader },
    deleted: { $ne: true },
    readBy: { $ne: reader },
    at: { $lte: upTo },
  })
    .select("user deliveredTo readBy")
    .lean();
  if (unread.length === 0) return [];

  const [, recipients] = await Promise.all([
    Message.updateMany(
      { _id: { $in: unread.map((m) => m._id) } },
      { $addToSet: { readBy: reader, deliveredTo: reader } },
    ),
    roomRecipients(room),
  ]);
  // Status after the update, computed in memory instead of re-reading the documents
  return unread.map((m) => ({
    messageId: m._id.toString(),
    sender: m.user,
    status: deliveryStatus({ user: m.user, readBy: [...m.readBy, reader], deliveredTo: [...m.deliveredTo, reader] }, recipients),
  }));
};

const createMessage = async (
  room: string,
  userId: string,
  username: string,
  text: string,
): Promise<ChatMessageDto> => {
  const at = new Date();
  const doc = await Message.create({ room, user: username, userId, type: "text", text, at });
  return toMessagePayload({
    id: doc._id.toString(),
    room,
    user: username,
    text,
    type: "text",
    at,
  });
};

const createFileMessage = async (
  room: string,
  user: AuthUser,
  sharedFile: SharedFileDocument,
  caption?: string,
): Promise<ChatMessageDto> => {
  const at = new Date();
  const fileMeta: MessageFileDto = {
    id: sharedFile._id.toString(),
    name: sharedFile.originalName,
    mimeType: sharedFile.mimeType,
    size: sharedFile.size,
  };
  const text = caption?.trim() || sharedFile.originalName;
  const doc = await Message.create({
    room,
    user: user.username,
    userId: user.id,
    type: "file",
    text,
    file: fileMeta,
    at,
  });
  return toMessagePayload({
    id: doc._id.toString(),
    room,
    user: user.username,
    text,
    type: "file",
    file: fileMeta,
    at,
  });
};

const getMessageById = async (id: string) => Message.findById(id).lean();

const deleteMessage = async (id: string): Promise<ChatMessageDto | null> => {
  const doc = await Message.findByIdAndUpdate(
    id,
    { deleted: true, type: "text", file: undefined },
    { new: true },
  ).lean();
  if (!doc) return null;
  return toMessagePayload({
    id: doc._id.toString(),
    room: doc.room,
    user: doc.user,
    text: doc.text,
    type: doc.type,
    file: doc.file,
    deleted: doc.deleted,
    at: doc.at,
  });
};

export const messageService = {
  getRoomMessages,
  createMessage,
  createFileMessage,
  getMessageById,
  deleteMessage,
  markDelivered,
  markRoomRead,
};
