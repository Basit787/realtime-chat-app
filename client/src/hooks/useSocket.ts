import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";
import type { ChatMessage } from "@/lib/api";
import { ROOM } from "@/lib/api";
import { SOCKET_URL } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useChatStore } from "@/stores/chat-store";

export function useSocket(): Socket | null {
  const token = useAuthStore((s) => s.token);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const addMessage = useChatStore((s) => s.addMessage);
  const setOnlineUsers = useChatStore((s) => s.setOnlineUsers);
  const setTypingUser = useChatStore((s) => s.setTypingUser);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setSocket(null);
      return;
    }

    const s = io(SOCKET_URL || undefined, {
      auth: { token },
      query: { room: ROOM },
    });

    setSocket(s);

    s.on("message", (message: ChatMessage) => addMessage(message));
    s.on("presence", (p: { count: number; users: string[] }) => setOnlineUsers(p.users ?? []));
    s.on("typing", (p: { username: string }) => {
      setTypingUser(p.username);
      setTimeout(() => setTypingUser(null), 1500);
    });

    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, [addMessage, isAuthenticated, setOnlineUsers, setTypingUser, token]);

  return socket;
}
