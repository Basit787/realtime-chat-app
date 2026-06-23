import { CheckCheck } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { UserAvatar } from "@/components/ui/user-avatar";
import { formatFileSize, formatMessageTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/api";
import { downloadFile, ROOM } from "@/lib/api";

type MessageBubbleProps = {
  message: ChatMessage;
  isOwn: boolean;
  showAvatar: boolean;
};

export function MessageBubble({ message, isOwn, showAvatar }: MessageBubbleProps) {
  const handleFileDownload = async () => {
    if (!message.file) return;
    try {
      const blob = await downloadFile(ROOM, message.file.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = message.file.name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className={cn("flex gap-2", isOwn ? "flex-row-reverse" : "flex-row")}>
      {!isOwn && showAvatar ? (
        <UserAvatar name={message.user} className="mt-1 h-8 w-8 [&_span]:h-8 [&_span]:w-8" />
      ) : (
        !isOwn && <div className="w-8 shrink-0" />
      )}

      <div className={cn("flex max-w-[70%] flex-col gap-1", isOwn ? "items-end" : "items-start")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
            isOwn
              ? "rounded-br-md bg-chat-outgoing text-white"
              : "rounded-bl-md bg-chat-incoming text-foreground",
          )}
        >
          {message.type === "file" && message.file ? (
            <button type="button" onClick={handleFileDownload} className="text-left underline-offset-2 hover:underline">
              {message.file.name}
              <span className="ml-2 text-xs opacity-70">({formatFileSize(message.file.size)})</span>
            </button>
          ) : (
            message.text
          )}
          {isOwn && (
            <div className="mt-1 flex items-center justify-end gap-1">
              <span className="text-[10px] text-white/70">{formatMessageTime(message.at)}</span>
              <CheckCheck className="h-3.5 w-3.5 text-primary-foreground/80" />
            </div>
          )}
        </div>
        {!isOwn && (
          <span className="px-1 text-[10px] text-muted-foreground">{formatMessageTime(message.at)}</span>
        )}
      </div>
    </div>
  );
}

type DateSeparatorProps = {
  date: string;
};

export function DateSeparator({ date }: DateSeparatorProps) {
  const d = new Date(date);
  let label = format(d, "MMMM d, yyyy");
  if (isToday(d)) label = "Today";
  else if (isYesterday(d)) label = "Yesterday";

  return (
    <div className="flex justify-center py-3">
      <span className="rounded-full bg-muted px-3 py-1 text-[11px] text-muted-foreground">{label}</span>
    </div>
  );
}

type MessageListProps = {
  messages: ChatMessage[];
  selfUsername: string;
};

export function MessageList({ messages, selfUsername }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        No messages yet. Say hello!
      </div>
    );
  }

  let lastDate = "";
  let lastUser = "";

  return (
    <div className="space-y-3 px-5 py-4">
      {messages.map((message, index) => {
        const dateKey = format(new Date(message.at), "yyyy-MM-dd");
        const showDate = dateKey !== lastDate;
        lastDate = dateKey;

        const isOwn = message.user === selfUsername;
        const showAvatar = !isOwn && message.user !== lastUser;
        lastUser = message.user;

        return (
          <div key={`${message.at}-${index}`}>
            {showDate && <DateSeparator date={message.at} />}
            <MessageBubble message={message} isOwn={isOwn} showAvatar={showAvatar} />
          </div>
        );
      })}
    </div>
  );
}
