import { useState } from "react";
import { CheckCheck } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { UserAvatar } from "@/components/ui/user-avatar";
import { FileAttachment } from "@/components/chat/FileAttachment";
import { CallHistoryItem } from "@/components/call/CallHistoryItem";
import { MessageActionMenu, useLongPress, type MessageAction } from "@/components/chat/MessageActionMenu";
import { ForwardDialog } from "@/components/chat/ForwardDialog";
import { formatMessageTime } from "@/lib/format";
import { DELETED_MESSAGE_LABEL, messageKey } from "@/lib/messages";
import { cn } from "@/lib/utils";
import { downloadFileAsAttachment } from "@/lib/useFileBlob";
import { deleteMessage, type CallHistoryEntry, type ChatMessage } from "@/pages/chat/api/api";
import { useChatStore } from "@/pages/chat/store/chat-store";
import { toastError, toastSuccess, toastWithUndo } from "@/lib/toast";
import { useChatRoom } from "@/pages/chat/context/ChatRoomContext";

type MessageBubbleProps = {
  message: ChatMessage;
  isOwn: boolean;
  showAvatar: boolean;
  selected: boolean;
  onOpenMenu: (x: number, y: number) => void;
};

const MessageBubble = ({ message, isOwn, showAvatar, selected, onOpenMenu }: MessageBubbleProps) => {
  const isDeleted = !!message.deleted;
  const isFile = !isDeleted && message.type === "file" && message.file;
  const longPress = useLongPress(onOpenMenu);

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
            "rounded-2xl text-sm leading-relaxed transition-shadow select-none",
            isFile ? "overflow-hidden p-1.5" : "px-4 py-2.5",
            isDeleted && "border border-dashed border-muted-foreground/30 bg-muted/40",
            !isDeleted &&
              (isOwn
                ? "rounded-br-md bg-chat-outgoing text-primary-foreground"
                : "rounded-bl-md bg-chat-incoming text-foreground"),
            selected && "ring-2 ring-primary/60",
          )}
          onContextMenu={(e) => {
            if (isDeleted) return;
            e.preventDefault();
            onOpenMenu(e.clientX, e.clientY);
          }}
          onTouchStart={(e) => {
            if (isDeleted) return;
            const touch = e.touches[0];
            if (touch) longPress.start(touch.clientX, touch.clientY);
          }}
          onTouchEnd={longPress.clear}
          onTouchMove={longPress.clear}
        >
          {isDeleted ? (
            <span
              className={cn(
                "text-[15px] italic",
                isOwn ? "text-primary-foreground/75" : "text-muted-foreground",
              )}
            >
              {DELETED_MESSAGE_LABEL}
            </span>
          ) : isFile ? (
            <FileAttachment
              room={message.room}
              file={message.file!}
              caption={message.text !== message.file!.name ? message.text : undefined}
              isOwn={isOwn}
            />
          ) : (
            <span className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">{message.text}</span>
          )}
          {isOwn && (
            <div className={cn("flex items-center justify-end gap-1", isFile ? "px-2 pb-1" : "mt-1")}>
              <span
                className={cn(
                  "text-[10px]",
                  isDeleted ? "text-muted-foreground" : "text-primary-foreground/70",
                )}
              >
                {formatMessageTime(message.at)}
              </span>
              {!isDeleted && <CheckCheck className="h-3.5 w-3.5 text-primary-foreground/80" />}
            </div>
          )}
        </div>
        {!isOwn && <span className="px-1 text-[10px] text-muted-foreground">{formatMessageTime(message.at)}</span>}
      </div>
    </div>
  );
}

type DateSeparatorProps = {
  date: string;
};

export const DateSeparator = ({ date }: DateSeparatorProps) => {
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

type TimelineItem =
  | { kind: "message"; at: string; message: ChatMessage }
  | { kind: "call"; at: string; call: CallHistoryEntry };

const buildTimeline = (messages: ChatMessage[], calls: CallHistoryEntry[]): TimelineItem[] => {
  const items: TimelineItem[] = [
    ...messages.map((message) => ({ kind: "message" as const, at: message.at, message })),
    ...calls.map((call) => ({ kind: "call" as const, at: call.startedAt, call })),
  ];
  return items.sort((a, b) => a.at.localeCompare(b.at));
}

export const MessageList = () => {
  const { visibleMessages, visibleCalls, username: selfUsername, socket } = useChatRoom();
  const messages = visibleMessages;
  const calls = visibleCalls;
  const setReplyTo = useChatStore((s) => s.setReplyTo);
  const setForwardMessage = useChatStore((s) => s.setForwardMessage);
  const hideMessageForMe = useChatStore((s) => s.hideMessageForMe);
  const unhideMessageForMe = useChatStore((s) => s.unhideMessageForMe);
  const markMessageDeleted = useChatStore((s) => s.markMessageDeleted);
  const restoreMessage = useChatStore((s) => s.restoreMessage);

  const [menu, setMenu] = useState<{ message: ChatMessage; x: number; y: number } | null>(null);
  const [forwardOpen, setForwardOpen] = useState(false);
  const [forwardTarget, setForwardTarget] = useState<ChatMessage | null>(null);

  const timeline = buildTimeline(messages, calls);

  const handleAction = async (action: MessageAction, message: ChatMessage) => {
    const key = messageKey(message);
    const copyText = message.deleted ? DELETED_MESSAGE_LABEL : message.type === "file" ? (message.file?.name ?? message.text) : message.text;

    if (action === "reply") {
      setReplyTo(message);
      return;
    }
    if (action === "copy") {
      try {
        await navigator.clipboard.writeText(copyText);
        toastSuccess("Copied");
      } catch {
        toastError(null, "Could not copy");
      }
      return;
    }
    if (action === "forward") {
      setForwardTarget(message);
      setForwardOpen(true);
      return;
    }
    if (action === "download") {
      if (!message.file) return;
      try {
        await downloadFileAsAttachment(message.room, message.file.id, message.file.name);
        toastSuccess("Download started");
      } catch (error) {
        toastError(error, "Could not download file");
      }
      return;
    }
    if (action === "delete-me") {
      hideMessageForMe(key);
      toastWithUndo("Message deleted for you", {
        onUndo: () => unhideMessageForMe(key),
      });
      return;
    }
    if (action === "delete-all") {
      if (!message.id) {
        toastError(null, "Cannot delete this message");
        return;
      }
      const snapshot: ChatMessage = { ...message, file: message.file ? { ...message.file } : undefined };
      markMessageDeleted({ ...message, deleted: true, text: "", file: undefined, type: "text" });
      toastWithUndo("Message deleted for everyone", {
        onUndo: () => restoreMessage(snapshot),
        onCommit: async () => {
          try {
            await deleteMessage(message.room, message.id!);
          } catch (error) {
            restoreMessage(snapshot);
            toastError(error, "Could not delete message");
          }
        },
      });
    }
  };

  if (timeline.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        No messages yet. Say hello!
      </div>
    );
  }

  let lastDate = "";
  let lastUser = "";

  return (
    <>
      <div className="space-y-3 px-5 py-4">
        {timeline.map((item, index) => {
          const dateKey = format(new Date(item.at), "yyyy-MM-dd");
          const showDate = dateKey !== lastDate;
          lastDate = dateKey;

          if (item.kind === "call") {
            return (
              <div key={`call-${item.call.id}`}>
                {showDate && <DateSeparator date={item.at} />}
                <CallHistoryItem call={item.call} selfUsername={selfUsername} compact />
              </div>
            );
          }

          const message = item.message;
          const isOwn = message.user === selfUsername;
          const showAvatar = !isOwn && message.user !== lastUser;
          lastUser = message.user;
          const key = messageKey(message);

          return (
            <div key={key}>
              {showDate && <DateSeparator date={message.at} />}
              <MessageBubble
                message={message}
                isOwn={isOwn}
                showAvatar={showAvatar}
                selected={menu?.message ? messageKey(menu.message) === key : false}
                onOpenMenu={(x, y) => !message.deleted && setMenu({ message, x, y })}
              />
            </div>
          );
        })}
      </div>

      <MessageActionMenu
        open={!!menu}
        x={menu?.x ?? 0}
        y={menu?.y ?? 0}
        isOwn={menu?.message.user === selfUsername}
        canDeleteForAll={!!menu?.message.id && !menu?.message.deleted}
        canCopy
        canDownload={!!menu?.message.file && !menu?.message.deleted}
        onAction={(action) => menu && void handleAction(action, menu.message)}
        onClose={() => setMenu(null)}
      />

      <ForwardDialog
        open={forwardOpen}
        message={forwardTarget}
        socket={socket}
        onClose={() => {
          setForwardOpen(false);
          setForwardTarget(null);
          setForwardMessage(null);
        }}
      />
    </>
  );
}
