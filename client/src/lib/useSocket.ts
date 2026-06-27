import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import type { ChatMessage } from "@/pages/chat/api/api";
import { GENERAL_ROOM } from "@/pages/chat/api/api";
import { conversationToRoom } from "@/lib/rooms";
import { useChatStore } from "@/pages/chat/store/chat-store";
import { useAuthStore } from "@/pages/auth/store/auth-store";
import { SOCKET_URL } from "@/lib/utils";

export function useSocket(): Socket | null {
  const token = useAuthStore((s) => s.token);
  const username = useAuthStore((s) => s.username);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const addMessage = useChatStore((s) => s.addMessage);
  const setOnlineUsers = useChatStore((s) => s.setOnlineUsers);
  const setTypingUser = useChatStore((s) => s.setTypingUser);
  const [socket, setSocket] = useState<Socket | null>(null);
  const joinedDmRoom = useRef<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setSocket(null);
      return;
    }

    const s = io(SOCKET_URL || undefined, { auth: { token } });
    setSocket(s);

    s.on("message", (message: ChatMessage) => addMessage(message));
    s.on("presence", (p: { room?: string; count: number; users: string[] }) => {
      if (!p.room || p.room === GENERAL_ROOM) setOnlineUsers(p.users ?? []);
    });
    s.on("typing", (p: { room: string; username: string }) => {
      setTypingUser(p.room, p.username);
      setTimeout(() => setTypingUser(p.room, null), 1500);
    });

    return () => {
      s.disconnect();
      setSocket(null);
      joinedDmRoom.current = null;
    };
  }, [addMessage, isAuthenticated, setOnlineUsers, setTypingUser, token]);

  useEffect(() => {
    if (!socket || !username) return;

    const activeRoom = conversationToRoom(activeConversationId, username);
    if (activeRoom === GENERAL_ROOM) {
      if (joinedDmRoom.current) {
        socket.emit("room:leave", { room: joinedDmRoom.current });
        joinedDmRoom.current = null;
      }
      return;
    }

    if (joinedDmRoom.current && joinedDmRoom.current !== activeRoom) {
      socket.emit("room:leave", { room: joinedDmRoom.current });
    }

    socket.emit("room:join", { room: activeRoom });
    joinedDmRoom.current = activeRoom;
  }, [activeConversationId, socket, username]);

  return socket;
}
