import { Bubble, BubbleContent, Message, MessageAvatar, MessageContent } from "#/ui";
import { formatMessageTime } from "#/common";
import { UserAvatar } from "@/components/avatar/user-avatar";
import { FileAttachment } from "@/components/chat/FileAttachment";
import { MessageStatus } from "@/components/chat/MessageStatus";
import { SelectionCheckbox } from "@/components/chat/SelectionCheckbox";
import { useLongPress } from "@/lib/use-long-press";
import { attachmentCaption, DELETED_MESSAGE_LABEL } from "@/lib/messages";
import { cn } from "@/lib/utils";
import { useUserProfileImage } from "@/lib/use-user-profile-image";
import type { ChatMessage } from "@/features/chat/api/api";
import type { MessageDeliveryStatus } from "@/features/chat/store/chat-store";

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

// One message as a card: a header (sender on the first of a run, time, receipts on your own),
// then text, a file or "deleted"; right-click or long-press opens its menu
export const MessageBubble = ({
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
            <MessageAvatar className="mt-0.5 size-8 self-start bg-transparent">
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
                  ? "*:data-[slot=bubble-content]:bg-chat-outgoing *:data-[slot=bubble-content]:text-foreground"
                  : "*:data-[slot=bubble-content]:bg-chat-incoming *:data-[slot=bubble-content]:text-foreground",
            )}
          >
            <BubbleContent
              className={cn(
                "rounded-md text-sm leading-relaxed shadow-xs transition-shadow",
                selectionMode && !isDeleted ? "cursor-pointer" : "select-none",
                isFile ? "px-2 pt-1.5 pb-2" : "px-4 pt-1.5 pb-2",
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
              <div className={cn("flex items-center gap-2 text-xs text-muted-foreground", isFile && "px-2")}>
                {!isOwn && showAvatar && <span className="font-semibold text-foreground">{message.user}</span>}
                <span>{formatMessageTime(message.at)}</span>
                {isOwn && !isDeleted && <MessageStatus status={deliveryStatus} className="text-muted-foreground" />}
              </div>
              {isDeleted ? (
                <span className="text-sm italic text-muted-foreground">{DELETED_MESSAGE_LABEL}</span>
              ) : isFile ? (
                <div className="mt-1">
                  <FileAttachment room={message.room} file={message.file!} caption={attachmentCaption(message)} />
                </div>
              ) : (
                <span className="whitespace-pre-wrap break-words text-sm leading-relaxed">{message.text}</span>
              )}
            </BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
    </div>
  );
};
