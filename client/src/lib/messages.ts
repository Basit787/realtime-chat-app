import type { ChatMessage } from "@/pages/chat/api/api";

export const DELETED_MESSAGE_LABEL = "This message is deleted";

export const messageKey = (message: ChatMessage) => message.id ?? `${message.room}:${message.at}:${message.user}`;

export const messagePreview = (message: ChatMessage) => {
  if (message.deleted) return DELETED_MESSAGE_LABEL;
  if (message.type === "file") return message.file?.name ?? message.text;
  return message.text;
};

export const formatReplyText = (replyTo: ChatMessage, text: string) =>
  `↩ ${replyTo.user}: ${messagePreview(replyTo)}\n${text}`;

export const formatForwardText = (message: ChatMessage) => {
  if (message.type === "file") {
    return `↪ ${message.file?.name ?? message.text}`;
  }
  return `↪ ${message.text}`;
};

export const messagesCopyText = (messages: ChatMessage[]) =>
  messages.map((message) => messagePreview(message)).join("\n\n");
