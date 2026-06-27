import { useEffect, useState } from "react";
import { format, isToday, isYesterday } from "date-fns";
import { Check } from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { FileAttachment } from "@/components/chat/FileAttachment";
import { MessageStatus } from "@/components/chat/MessageStatus";
import { CallHistoryItem } from "@/components/call/CallHistoryItem";
import { MessageActionMenu, useLongPress, type MessageAction } from "@/components/chat/MessageActionMenu";
import { ForwardDialog } from "@/components/chat/ForwardDialog";
import { formatMessageTime } from "@/lib/format";
import { DELETED_MESSAGE_LABEL, messageKey } from "@/lib/messages";
import { cn } from "@/lib/utils";
import { downloadFileAsAttachment } from "@/lib/useFileBlob";
import { useUserProfileImage } from "@/lib/use-user-profile-image";
import { useSingleMessageActions } from "@/lib/use-message-bulk-actions";
import type { CallHistoryEntry, ChatMessage } from "@/pages/chat/api/api";
import { useChatStore, type MessageDeliveryStatus } from "@/pages/chat/store/chat-store";
import { toastError, toastSuccess } from "@/lib/toast";
import { useChatRoom } from "@/pages/chat/context/ChatRoomContext";

type MessageBubbleProps = {
  message: ChatMessage;
  isOwn: boolean;
  showAvatar: boolean;
  highlighted: boolean;
  selectionMode: boolean;
  isChecked: boolean;
  deliveryStatus: MessageDeliveryStatus;
  onOpenMenu: (x: number, y: number) => void;
  onToggleSelect: () => void;
};

const MessageMeta = ({
  at,
  isDeleted,
  isOwn,
  isFile,
  deliveryStatus,
}: {
  at: string;
  isDeleted: boolean;
  isOwn: boolean;
  isFile: boolean;
  deliveryStatus: MessageDeliveryStatus;
}) => {
  if (!isOwn) return null;

  return (
    <div className={cn("flex items-center justify-end gap-1", isFile ? "px-2 pb-1 pt-0.5" : "mt-1")}>
      <span
        className={cn(
          "text-[10px]",
          isDeleted ? "text-muted-foreground" : "text-primary-foreground/70",
        )}
      >
        {formatMessageTime(at)}
      </span>
      {!isDeleted && <MessageStatus status={deliveryStatus} className="text-primary-foreground/80" />}
    </div>
  );
};

const SelectionCheckbox = ({ checked, onToggle }: { checked: boolean; onToggle: () => void }) => (
  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      onToggle();
    }}
    className={cn(
      "mt-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
      checked ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/50 bg-background",
    )}
    aria-label={checked ? "Deselect message" : "Select message"}
    aria-pressed={checked}
  >
    {checked && <Check className="h-3 w-3" strokeWidth={3} />}
  </button>
);

const MessageBubble = ({
  message,
  isOwn,
  showAvatar,
  highlighted,
  selectionMode,
  isChecked,
  deliveryStatus,
  onOpenMenu,
  onToggleSelect,
}: MessageBubbleProps) => {
  const isDeleted = !!message.deleted;
  const isFile = !isDeleted && message.type === "file" && message.file;
  const senderImage = useUserProfileImage(message.user);
  const longPress = useLongPress((x, y) => {
    if (selectionMode) onToggleSelect();
    else onOpenMenu(x, y);
  });

  const handleClick = () => {
    if (selectionMode && !isDeleted) onToggleSelect();
  };

  return (
    <div className={cn("flex w-full gap-2", isOwn ? "justify-end" : "justify-start")}>
      {selectionMode && <SelectionCheckbox checked={isChecked} onToggle={onToggleSelect} />}

      {!isOwn && showAvatar && !selectionMode ? (
        <UserAvatar
          name={message.user}
          imageUrl={senderImage}
          className="mt-1 h-8 w-8 [&_span]:h-8 [&_span]:w-8"
        />
      ) : (
        !isOwn && !selectionMode && <div className="w-8 shrink-0" />
      )}

      <div className={cn("flex max-w-[70%] flex-col gap-1", isOwn ? "items-end" : "items-start")}>
        <div
          className={cn(
            "rounded-2xl text-sm leading-relaxed transition-shadow",
            selectionMode && !isDeleted ? "cursor-pointer" : "select-none",
            isFile ? "overflow-hidden p-1.5" : "px-4 py-2.5",
            isDeleted && "border border-dashed border-muted-foreground/30 bg-muted/40",
            !isDeleted &&
              (isOwn
                ? "rounded-br-md bg-chat-outgoing text-primary-foreground"
                : "rounded-bl-md bg-chat-incoming text-foreground"),
            (highlighted || (selectionMode && isChecked)) && "ring-2 ring-primary/60",
          )}
          onClick={handleClick}
          onContextMenu={(e) => {
            if (isDeleted || selectionMode) return;
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
              footer={
                <MessageMeta
                  at={message.at}
                  isDeleted={isDeleted}
                  isOwn={isOwn}
                  isFile
                  deliveryStatus={deliveryStatus}
                />
              }
            />
          ) : (
            <span className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">{message.text}</span>
          )}
          {!isFile && (
            <MessageMeta
              at={message.at}
              isDeleted={isDeleted}
              isOwn={isOwn}
              isFile={false}
              deliveryStatus={deliveryStatus}
            />
          )}
        </div>
        {!isOwn && <span className="px-1 text-[10px] text-muted-foreground">{formatMessageTime(message.at)}</span>}
      </div>
    </div>
  );
};

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
};

type TimelineItem =
  | { kind: "message"; at: string; message: ChatMessage }
  | { kind: "call"; at: string; call: CallHistoryEntry };

const buildTimeline = (messages: ChatMessage[], calls: CallHistoryEntry[]): TimelineItem[] => {
  const items: TimelineItem[] = [
    ...messages.map((message) => ({ kind: "message" as const, at: message.at, message })),
    ...calls.map((call) => ({ kind: "call" as const, at: call.startedAt, call })),
  ];
  return items.sort((a, b) => a.at.localeCompare(b.at));
};

export const MessageList = () => {
  const { visibleMessages, visibleCalls, username: selfUsername, socket } = useChatRoom();
  const messages = visibleMessages;
  const calls = visibleCalls;
  const messageStatus = useChatStore((s) => s.messageStatus);
  const messageSelectionMode = useChatStore((s) => s.messageSelectionMode);
  const selectedMessageKeys = useChatStore((s) => s.selectedMessageKeys);
  const toggleMessageKey = useChatStore((s) => s.toggleMessageKey);
  const exitMessageSelection = useChatStore((s) => s.exitMessageSelection);
  const forwardBatch = useChatStore((s) => s.forwardBatch);
  const setForwardBatch = useChatStore((s) => s.setForwardBatch);

  const { runAction } = useSingleMessageActions();

  const [menu, setMenu] = useState<{ message: ChatMessage; x: number; y: number } | null>(null);
  const [forwardOpen, setForwardOpen] = useState(false);

  const timeline = buildTimeline(messages, calls);

  useEffect(() => {
    if (forwardBatch.length === 0) return;
    setForwardOpen(true);
  }, [forwardBatch]);

  useEffect(() => {
    if (!messageSelectionMode) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") exitMessageSelection();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [exitMessageSelection, messageSelectionMode]);

  const handleAction = async (action: MessageAction, message: ChatMessage) => {
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
    await runAction(action, message, (batch) => setForwardBatch(batch));
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
        {timeline.map((item) => {
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
          const isChecked = selectedMessageKeys.includes(key);

          return (
            <div key={key}>
              {showDate && <DateSeparator date={message.at} />}
              <MessageBubble
                message={message}
                isOwn={isOwn}
                showAvatar={showAvatar}
                highlighted={menu?.message ? messageKey(menu.message) === key : false}
                selectionMode={messageSelectionMode && !message.deleted}
                isChecked={isChecked}
                deliveryStatus={message.id ? (messageStatus[message.id] ?? "sent") : "sent"}
                onOpenMenu={(x, y) => !message.deleted && setMenu({ message, x, y })}
                onToggleSelect={() => !message.deleted && toggleMessageKey(key)}
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
        messages={forwardBatch}
        socket={socket}
        onClose={() => {
          setForwardOpen(false);
          setForwardBatch([]);
          exitMessageSelection();
        }}
      />
    </>
  );
};
