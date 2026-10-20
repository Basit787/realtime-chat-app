import { useEffect, useState } from "react";
import { format, isToday, isYesterday } from "date-fns";
import { Check } from "lucide-react";
import {
  Bubble,
  BubbleContent,
  Marker,
  MarkerContent,
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
} from "pui";
import { UserAvatar } from "@/components/avatar/user-avatar";
import { FileAttachment } from "@/components/chat/FileAttachment";
import { MessageStatus } from "@/components/chat/MessageStatus";
import { CallHistoryItem } from "@/components/call/CallHistoryItem";
import { MessageActionMenu, type MessageAction } from "@/components/chat/MessageActionMenu";
import { useLongPress } from "@/lib/use-long-press";
import { ForwardDialog } from "@/components/chat/ForwardDialog";
import { formatMessageTime } from "frontend-common";
import { attachmentCaption, DELETED_MESSAGE_LABEL, messageKey } from "@/lib/messages";
import { cn } from "@/lib/utils";
import { downloadFileAsAttachment } from "@/lib/useFileBlob";
import { useUserProfileImage } from "@/lib/use-user-profile-image";
import { useSingleMessageActions } from "@/lib/use-message-bulk-actions";
import type { CallHistoryEntry, ChatMessage } from "@/features/chat/api/api";
import { useChatStore, type MessageDeliveryStatus } from "@/features/chat/store/chat-store";
import { toastError, toastSuccess } from "@/lib/toast";
import { useChatRoom } from "@/features/chat/context/use-chat-room";
import { resolveDeliveryStatus } from "@/lib/message-receipts";

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
  onOpenProfile: () => void;
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
      <span className={cn("text-[10px]", isDeleted ? "text-muted-foreground" : "text-primary-foreground/70")}>
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
  onOpenProfile,
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
    <div className="flex w-full items-start gap-2">
      {selectionMode && <SelectionCheckbox checked={isChecked} onToggle={onToggleSelect} />}

      <Message align={isOwn ? "end" : "start"} className="min-w-0 flex-1">
        {!isOwn &&
          !selectionMode &&
          (showAvatar ? (
            <MessageAvatar className="mt-1 size-8 self-start bg-transparent">
              <button
                type="button"
                onClick={onOpenProfile}
                className="size-8 rounded-full"
                aria-label={`View ${message.user}'s profile`}
              >
                <UserAvatar name={message.user} imageUrl={senderImage} className="h-8 w-8" />
              </button>
            </MessageAvatar>
          ) : (
            <div className="w-8 shrink-0" />
          ))}

        <MessageContent>
          <Bubble
            align={isOwn ? "end" : "start"}
            className={cn(
              "max-w-[85%] sm:max-w-[70%]",
              isDeleted
                ? "*:data-[slot=bubble-content]:border-dashed *:data-[slot=bubble-content]:border-muted-foreground/30 *:data-[slot=bubble-content]:bg-muted/40"
                : isOwn
                  ? "*:data-[slot=bubble-content]:bg-chat-outgoing *:data-[slot=bubble-content]:text-primary-foreground"
                  : "*:data-[slot=bubble-content]:bg-chat-incoming *:data-[slot=bubble-content]:text-foreground",
            )}
          >
            <BubbleContent
              className={cn(
                "rounded-2xl text-sm leading-relaxed transition-shadow",
                selectionMode && !isDeleted ? "cursor-pointer" : "select-none",
                isFile ? "p-1.5" : "px-4 py-2.5",
                !isDeleted && (isOwn ? "rounded-br-md" : "rounded-bl-md"),
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
                  className={cn("text-[15px] italic", isOwn ? "text-primary-foreground/75" : "text-muted-foreground")}
                >
                  {DELETED_MESSAGE_LABEL}
                </span>
              ) : isFile ? (
                <FileAttachment
                  room={message.room}
                  file={message.file!}
                  caption={attachmentCaption(message)}
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
            </BubbleContent>
          </Bubble>
          {!isOwn && <MessageFooter className="text-[10px]">{formatMessageTime(message.at)}</MessageFooter>}
        </MessageContent>
      </Message>
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
    <Marker variant="separator" className="py-3 text-[11px]">
      <MarkerContent>{label}</MarkerContent>
    </Marker>
  );
};

type TimelineItem =
  { kind: "message"; at: string; message: ChatMessage } | { kind: "call"; at: string; call: CallHistoryEntry };

const buildTimeline = (messages: ChatMessage[], calls: CallHistoryEntry[]): TimelineItem[] => {
  const items: TimelineItem[] = [
    ...messages.map((message) => ({ kind: "message" as const, at: message.at, message })),
    ...calls.map((call) => ({ kind: "call" as const, at: call.startedAt, call })),
  ];
  return items.sort((a, b) => a.at.localeCompare(b.at));
};

export const MessageList = () => {
  const { visibleMessages, visibleCalls, username: selfUsername, socket, actions } = useChatRoom();
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
      <div className="space-y-3 px-3 py-4 sm:px-5">
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
                deliveryStatus={resolveDeliveryStatus(message, message.id ? messageStatus[message.id] : undefined)}
                onOpenMenu={(x, y) => !message.deleted && setMenu({ message, x, y })}
                onToggleSelect={() => !message.deleted && toggleMessageKey(key)}
                onOpenProfile={() => actions.openContactInfo(message.user)}
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
