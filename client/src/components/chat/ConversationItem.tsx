import { formatConversationTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { Conversation } from "@/stores/chat-store";

type ConversationItemProps = {
  conversation: Conversation;
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
};

export function ConversationItem({ conversation, active, onClick, icon }: ConversationItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
        active ? "bg-primary/10" : "hover:bg-muted/60",
      )}
    >
      {active && <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-primary" />}
      {icon ?? (
        <UserAvatar
          name={conversation.name}
          showOnline={conversation.type === "dm"}
          online={conversation.online}
        />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-medium">
            {conversation.type === "channel" ? `# ${conversation.name}` : conversation.name}
          </span>
          {conversation.lastAt && (
            <span className="shrink-0 text-[11px] text-muted-foreground">
              {formatConversationTime(conversation.lastAt)}
            </span>
          )}
        </div>
        {conversation.lastMessage && (
          <p className="truncate text-xs text-muted-foreground">{conversation.lastMessage}</p>
        )}
      </div>
    </button>
  );
}
