import type { Socket } from "socket.io-client";
import type { ChatMessage } from "@/pages/chat/api/api";
import { conversationToRoom } from "@/lib/rooms";
import { useAuthStore } from "@/pages/auth/store/auth-store";
import { useChatStore } from "@/pages/chat/store/chat-store";

export const handleIncomingMessageReceipts = (socket: Socket, message: ChatMessage) => {
  const username = useAuthStore.getState().username;
  if (!username || !message.id) return;

  const { activeConversationId, setMessageStatus } = useChatStore.getState();
  const activeRoom = conversationToRoom(activeConversationId, username);

  if (message.user === username) {
    setMessageStatus(message.id, "sent");
    return;
  }

  socket.emit("message:ack", { messageId: message.id, room: message.room });

  if (message.room === activeRoom) {
    socket.emit("room:read", { room: message.room, messageId: message.id });
  }
};

export const emitReadReceiptsForRoom = (socket: Socket, room: string, username: string) => {
  const { messages } = useChatStore.getState();
  const lastPeerMessage = messages
    .filter((m) => m.room === room && m.user !== username && m.id && !m.deleted)
    .at(-1);

  if (lastPeerMessage?.id) {
    socket.emit("room:read", { room, messageId: lastPeerMessage.id });
  }
};
