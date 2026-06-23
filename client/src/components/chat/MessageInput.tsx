import { useRef, useState } from "react";
import { Paperclip, Send, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadFile, ROOM } from "@/lib/api";
import { useChatStore } from "@/stores/chat-store";

import type { Socket } from "socket.io-client";

type MessageInputProps = {
  socket: Socket | null;
};

export function MessageInput({ socket }: MessageInputProps) {
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addMessage = useChatStore((s) => s.addMessage);

  const sendMessage = () => {
    const trimmed = text.trim();
    if (!trimmed || !socket) return;
    socket.emit("message", trimmed);
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
      const message = await uploadFile(ROOM, file);
      addMessage(message);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="border-t border-border/50 px-5 py-4">
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
          size="sm"
          className="h-10 w-10 shrink-0 rounded-full p-0 text-muted-foreground"
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
              socket?.emit("typing");
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="h-11 rounded-2xl border-border/60 bg-input pr-10 text-sm"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Emoji"
          >
            <Smile className="h-5 w-5" />
          </button>
        </div>

        <Button
          type="button"
          size="sm"
          className="h-11 w-11 shrink-0 rounded-full p-0 shadow-[0_0_20px_rgba(20,184,166,0.35)]"
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
