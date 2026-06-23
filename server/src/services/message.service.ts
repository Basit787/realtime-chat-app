import { Message } from "../models/index.js";
import type { ChatMessageDto, MessageFileDto } from "../types/api.js";
import type { AuthUser } from "../types/index.js";
import type { SharedFileDocument } from "../models/SharedFile.js";

function toMessagePayload(message: {
  user: string;
  text: string;
  type?: "text" | "file";
  file?: MessageFileDto;
  at: Date;
}): ChatMessageDto {
  return {
    user: message.user,
    text: message.text,
    type: message.type ?? "text",
    file: message.file,
    at: message.at.toISOString(),
  };
}

export class MessageService {
  async getRoomMessages(room: string): Promise<ChatMessageDto[]> {
    const messages = await Message.find({ room }).sort({ at: 1 }).limit(200).lean();
    return messages.map((message) =>
      toMessagePayload({
        user: message.user,
        text: message.text,
        type: message.type,
        file: message.file,
        at: message.at,
      }),
    );
  }

  async createMessage(room: string, userId: string, username: string, text: string): Promise<ChatMessageDto> {
    const at = new Date();
    await Message.create({ room, user: username, userId, type: "text", text, at });
    return toMessagePayload({ user: username, text, type: "text", at });
  }

  async createFileMessage(
    room: string,
    user: AuthUser,
    sharedFile: SharedFileDocument,
    caption?: string,
  ): Promise<ChatMessageDto> {
    const at = new Date();
    const fileMeta: MessageFileDto = {
      id: sharedFile._id.toString(),
      name: sharedFile.originalName,
      mimeType: sharedFile.mimeType,
      size: sharedFile.size,
    };
    const text = caption?.trim() || sharedFile.originalName;
    await Message.create({
      room,
      user: user.username,
      userId: user.id,
      type: "file",
      text,
      file: fileMeta,
      at,
    });
    return toMessagePayload({ user: user.username, text, type: "file", file: fileMeta, at });
  }

  async deleteMessage(id: string): Promise<void> {
    await Message.findByIdAndDelete(id);
  }
}

export const messageService = new MessageService();
