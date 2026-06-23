import mongoose from "mongoose";
import type { MessageFileDto, MessageType } from "../types/api.js";

export type IMessageFile = MessageFileDto;

export interface IMessage {
  room: string;
  user: string;
  userId?: string;
  type: MessageType;
  text: string;
  file?: IMessageFile;
  at: Date;
}

const messageFileSchema = new mongoose.Schema<IMessageFile>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
  },
  { _id: false },
);

const messageSchema = new mongoose.Schema<IMessage>({
  room: { type: String, required: true, index: true },
  user: { type: String, required: true },
  userId: { type: String, index: true },
  type: { type: String, enum: ["text", "file"], default: "text" },
  text: { type: String, required: true, maxlength: 2000 },
  file: { type: messageFileSchema, required: false },
  at: { type: Date, default: Date.now },
});

export const Message = mongoose.model<IMessage>("Message", messageSchema);

export type MessageDocument = mongoose.HydratedDocument<IMessage>;
