import { formatConversationTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { Conversation } from "@/pages/chat/store/chat-store";

type ConversationItemProps = {
  conversation: Conversation;
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
};

export const ConversationItem = ({ conversation, active, onClick, icon }: ConversationItemProps) => {
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onClick}
      className={cn(
        "relative h-auto w-full justify-start gap-3 rounded-xl px-3 py-2.5 text-left font-normal",
        active ? "bg-accent text-accent-foreground hover:bg-accent" : "hover:bg-accent/50",
      )}
    >
      {active && <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-primary" />}
      {icon ?? (
        <UserAvatar
          name={conversation.name}
          showOnline={conversation.type === "dm"}
          status={conversation.presenceStatus}
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
    </Button>
  );
}
