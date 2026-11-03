import { formatConversationTime } from "#/common";
import { useUserProfileImage } from "@/lib/use-user-profile-image";
import { cn } from "@/lib/utils";
import { Button } from "#/ui";
import { UserAvatar } from "@/components/avatar/user-avatar";
import type { Conversation } from "@/features/chat/store/chat-store";

type ConversationItemProps = {
  conversation: Conversation;
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
};

export const ConversationItem = ({ conversation, active, onClick, icon }: ConversationItemProps) => {
  const unread = conversation.unreadCount ?? 0;
  const hasUnread = unread > 0;
  const profileImage = useUserProfileImage(conversation.name);

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onClick}
      className={cn(
        "relative h-auto w-full justify-start gap-3 rounded-md px-3 py-2 text-left font-normal",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm hover:bg-sidebar-accent"
          : "hover:bg-sidebar-accent/70",
      )}
    >
      <div className="relative shrink-0">
        {icon ?? (
          <UserAvatar
            name={conversation.name}
            imageUrl={conversation.type === "dm" ? profileImage : undefined}
            showOnline={conversation.type === "dm"}
            status={conversation.presenceStatus}
            className="h-8 w-8"
          />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className={cn("truncate text-sm", hasUnread ? "font-bold" : "font-normal")}>
            {conversation.type === "channel" ? `# ${conversation.name}` : conversation.name}
          </span>
          {conversation.lastAt && (
            <span className="shrink-0 text-[11px] text-muted-foreground">
              {formatConversationTime(conversation.lastAt)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <p
            className={cn(
              "min-w-0 flex-1 truncate text-xs",
              hasUnread ? "font-semibold text-foreground" : "text-muted-foreground",
            )}
          >
            {conversation.lastMessage ?? ""}
          </p>
          {hasUnread && (
            <span className="flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </div>
      </div>
    </Button>
  );
};
