import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { fetchMessages } from "@/pages/chat/api/api";
import { conversationToRoom } from "@/lib/rooms";
import { useChatStore } from "@/pages/chat/store/chat-store";
import { useAuthStore } from "@/pages/auth/store/auth-store";

export function useChat() {
  const username = useAuthStore((s) => s.username);
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const mergeMessages = useChatStore((s) => s.mergeMessages);
  const room = conversationToRoom(activeConversationId, username);

  const messages = useQuery({
    queryKey: ["messages", room],
    queryFn: () => fetchMessages(room),
    enabled: !!username,
  });

  useEffect(() => {
    if (messages.data) mergeMessages(room, messages.data);
  }, [messages.data, mergeMessages, room]);

  return { messages, room };
}
