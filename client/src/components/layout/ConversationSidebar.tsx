import { Hash, LogOut, Palette, Search, Settings, SquarePen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConversationItem } from "@/components/chat/ConversationItem";
import { buildConversations, useChatStore, type UserStatus } from "@/stores/chat-store";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

type ConversationSidebarProps = {
  onLogout: () => void;
};

const STATUS_OPTIONS: { value: UserStatus; label: string; color: string }[] = [
  { value: "online", label: "Online", color: "bg-online" },
  { value: "away", label: "Away", color: "bg-amber-400" },
  { value: "busy", label: "Busy", color: "bg-red-500" },
  { value: "offline", label: "Offline", color: "bg-muted-foreground/50" },
];

export function ConversationSidebar({ onLogout }: ConversationSidebarProps) {
  const username = useAuthStore((s) => s.username);
  const messages = useChatStore((s) => s.messages);
  const onlineUsers = useChatStore((s) => s.onlineUsers);
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const searchQuery = useChatStore((s) => s.searchQuery);
  const userStatus = useChatStore((s) => s.userStatus);
  const setActiveConversation = useChatStore((s) => s.setActiveConversation);
  const setSearchQuery = useChatStore((s) => s.setSearchQuery);
  const setUserStatus = useChatStore((s) => s.setUserStatus);

  const conversations = buildConversations(messages, onlineUsers, username).filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const currentStatus = STATUS_OPTIONS.find((s) => s.value === userStatus) ?? STATUS_OPTIONS[0];

  return (
    <aside className="flex w-full max-w-[320px] shrink-0 flex-col border-r border-border/50 bg-sidebar md:w-[300px] lg:w-[320px]">
      <div className="flex items-center justify-between gap-2 border-b border-border/50 px-4 py-4">
        <div className="flex items-center gap-3">
          <UserAvatar name={username} showOnline online />
          <div>
            <p className="text-sm font-semibold">ChatWave</p>
            <p className="text-xs text-muted-foreground">@{username}</p>
          </div>
        </div>
        <button
          type="button"
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="New chat"
        >
          <SquarePen className="h-4 w-4" />
        </button>
      </div>

      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search conversations"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 rounded-xl border-border/60 bg-input pl-9 text-sm"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="space-y-0.5 pb-2">
          {conversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              active={activeConversationId === conversation.id}
              onClick={() => setActiveConversation(conversation.id)}
              icon={
                conversation.type === "channel" ? (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15">
                    <Hash className="h-4 w-4 text-primary" />
                  </div>
                ) : conversation.type === "group" ? (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/20">
                    <Palette className="h-4 w-4 text-violet-400" />
                  </div>
                ) : undefined
              }
            />
          ))}
        </div>
      </ScrollArea>

      <div className="flex items-center justify-between border-t border-border/50 px-4 py-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <span className={cn("h-2 w-2 rounded-full", currentStatus.color)} />
              {currentStatus.label}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {STATUS_OPTIONS.map((option) => (
              <DropdownMenuItem key={option.value} onClick={() => setUserStatus(option.value)}>
                <span className={cn("mr-2 h-2 w-2 rounded-full", option.color)} />
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          type="button"
          onClick={onLogout}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Logout"
        >
          <LogOut className="h-4 w-4" />
        </button>

        <button
          type="button"
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Settings"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
