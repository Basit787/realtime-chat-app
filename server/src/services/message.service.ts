import { Message } from "../models/index.js";
import type { ChatMessageDto, MessageFileDto } from "../types/api.js";
import type { AuthUser } from "../types/index.js";
import type { SharedFileDocument } from "../models/SharedFile.js";
import { dmRoomAliases, parseDmRoom } from "../utils/room.js";

const dmRoomsToQuery = (room: string): string[] => {
  const participants = parseDmRoom(room);
  if (!participants) return [room];
  return dmRoomAliases(participants[0], participants[1]);
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

const getRoomMessages = async (room: string): Promise<ChatMessageDto[]> => {
  const rooms = dmRoomsToQuery(room);
  const messages = await Message.find({ room: { $in: rooms } }).sort({ at: 1 }).limit(200).lean();
  return messages.map((message) =>
    toMessagePayload({
      id: message._id.toString(),
      room: message.room,
      user: message.user,
      text: message.text,
      type: message.type,
      file: message.file,
      deleted: message.deleted,
      at: message.at,
    }),
  );
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
};
