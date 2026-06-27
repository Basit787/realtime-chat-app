import { useRef, useState } from "react";
import { Paperclip, Send, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadFile } from "@/pages/chat/api/api";
import { conversationToRoom } from "@/lib/rooms";
import { useChatStore } from "@/pages/chat/store/chat-store";
import { useAuthStore } from "@/pages/auth/store/auth-store";
import { toastError } from "@/lib/toast";

import type { Socket } from "socket.io-client";

type MessageInputProps = {
  socket: Socket | null;
};

export function MessageInput({ socket }: MessageInputProps) {
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const username = useAuthStore((s) => s.username);
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const addMessage = useChatStore((s) => s.addMessage);
  const room = conversationToRoom(activeConversationId, username);

  const sendMessage = () => {
    const trimmed = text.trim();
    if (!trimmed || !socket) return;
    socket.emit("message", { room, text: trimmed });
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const message = await uploadFile(room, file);
      addMessage(message);
    } catch (error) {
      toastError(error, "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="border-t border-border px-5 py-4">
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 rounded-full text-muted-foreground"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          aria-label="Attach file"
        >
          <Paperclip className="h-5 w-5" />
        </Button>

        <div className="relative flex-1">
          <Input
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              socket?.emit("typing", { room });
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="h-11 rounded-2xl bg-input pr-10 text-sm"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground"
            aria-label="Emoji"
          >
            <Smile className="h-5 w-5" />
          </Button>
        </div>

        <Button
          type="button"
          size="icon"
          className="h-11 w-11 shrink-0 rounded-full"
          onClick={sendMessage}
          disabled={!text.trim()}
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
