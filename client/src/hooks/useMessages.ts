import { useQuery } from "@tanstack/react-query";
import { fetchMessages, ROOM } from "@/lib/api";
import { useChatStore } from "@/stores/chat-store";
import { useEffect } from "react";

export function useMessages() {
  const setMessages = useChatStore((s) => s.setMessages);

  const query = useQuery({
    queryKey: ["messages", ROOM],
    queryFn: () => fetchMessages(ROOM),
  });

  useEffect(() => {
    if (query.data) setMessages(query.data);
  }, [query.data, setMessages]);

  return query;
}
