import { useState } from "react";
import { Hash, LogOut, Palette, Phone, Search, SquarePen, UserRound, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { ConversationItem } from "@/components/chat/ConversationItem";
import { GroupAvatar } from "@/components/ui/group-avatar";
import { CreateGroupDialog } from "@/components/chat/CreateGroupDialog";
import { NewDirectMessageDialog } from "@/components/chat/NewDirectMessageDialog";
import { ProfileSection } from "@/components/profile/ProfileSection";
import { CallHistorySection } from "@/components/call/CallHistorySection";
import { useAuthStore } from "@/pages/auth/store/auth-store";
import { usePresenceStatus } from "@/pages/auth/api/profile-hooks";
import { buildConversations, useChatStore, type UserStatus } from "@/pages/chat/store/chat-store";
import { cn } from "@/lib/utils";

type ConversationSidebarProps = {
  onLogout: () => void;
};

const STATUS_OPTIONS: { value: UserStatus; label: string; color: string }[] = [
  { value: "online", label: "Online", color: "bg-online" },
  { value: "away", label: "Away", color: "bg-amber-400" },
  { value: "busy", label: "Busy", color: "bg-destructive" },
  { value: "offline", label: "Offline", color: "bg-muted-foreground/50" },
];

export const ConversationSidebar = ({ onLogout }: ConversationSidebarProps) => {
  const username = useAuthStore((s) => s.username);
  const profileImage = useAuthStore((s) => s.profileImage);
  const messages = useChatStore((s) => s.messages);
  const groups = useChatStore((s) => s.groups);
  const callHistory = useChatStore((s) => s.callHistory);
  const knownContacts = useChatStore((s) => s.knownContacts);
  const onlineUsers = useChatStore((s) => s.onlineUsers);
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const sidebarView = useChatStore((s) => s.sidebarView);
  const userStatuses = useChatStore((s) => s.userStatuses);
  const unreadByConversation = useChatStore((s) => s.unreadByConversation);
  const searchQuery = useChatStore((s) => s.searchQuery);
  const { userStatus, changeStatus } = usePresenceStatus();
  const setActiveConversation = useChatStore((s) => s.setActiveConversation);
  const setSidebarView = useChatStore((s) => s.setSidebarView);
  const setSearchQuery = useChatStore((s) => s.setSearchQuery);

  const [newDmOpen, setNewDmOpen] = useState(false);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);

  const conversations = buildConversations(messages, onlineUsers, username, groups, callHistory, knownContacts, userStatuses, unreadByConversation).filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const currentStatus = STATUS_OPTIONS.find((s) => s.value === userStatus) ?? STATUS_OPTIONS[0];
  const overlayView = sidebarView === "profile" || sidebarView === "calls";

  return (
    <aside
      className={cn(
        "flex h-full min-h-0 shrink-0 flex-col border-r border-border bg-sidebar text-sidebar-foreground",
        "w-full max-w-[320px] md:w-[300px] lg:w-[320px]",
        overlayView && "max-md:fixed max-md:inset-0 max-md:z-20 max-md:max-w-none",
      )}
    >
      {sidebarView === "profile" ? (
        <ProfileSection
          onBack={() => setSidebarView("conversations")}
          onLogout={onLogout}
          onViewCalls={() => setSidebarView("calls")}
        />
      ) : sidebarView === "calls" ? (
        <CallHistorySection onBack={() => setSidebarView("conversations")} />
      ) : (
        <>
          <div className="flex w-full shrink-0 items-center justify-between gap-2 border-b border-border px-4 py-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setSidebarView("profile")}
              className="h-auto min-w-0 flex-1 justify-start gap-3 rounded-lg px-0 py-0 font-normal hover:bg-accent/50"
            >
              <UserAvatar name={username} imageUrl={profileImage} showOnline status={userStatus} />
              <div className="min-w-0">
                <p className="text-sm font-semibold">ChatWave</p>
                <p className="text-xs text-muted-foreground">@{username}</p>
              </div>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  aria-label="New conversation"
                >
                  <SquarePen className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    setNewDmOpen(true);
                  }}
                >
                  <UserRound className="mr-2 h-4 w-4" />
                  New message
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    setCreateGroupOpen(true);
                  }}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Create group
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="shrink-0 px-4 py-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search conversations"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 rounded-xl bg-input pl-9 text-sm"
              />
            </div>
          </div>

          <ScrollArea className="min-h-0 flex-1 px-2">
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
                  (() => {
                    const group = groups.find((g) => g.room === conversation.room);
                    return group ? (
                      <GroupAvatar
                        groupId={group.id}
                        name={group.name}
                        imageUrl={group.image}
                        className="h-10 w-10"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
                        <Palette className="h-4 w-4 text-accent-foreground" />
                      </div>
                    );
                  })()
                ) : undefined
              }
                />
              ))}
            </div>
          </ScrollArea>

          <div className="flex shrink-0 items-center justify-between border-t border-border px-4 py-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost" size="sm" className="gap-2 px-2 text-muted-foreground">
                  <span className={cn("h-2 w-2 rounded-full", currentStatus.color)} />
                  {currentStatus.label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {STATUS_OPTIONS.map((option) => (
                  <DropdownMenuItem key={option.value} onClick={() => void changeStatus(option.value)}>
                    <span className={cn("mr-2 h-2 w-2 rounded-full", option.color)} />
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => setSidebarView("calls")}
                aria-label="Call history"
              >
                <Phone className="h-4 w-4" />
              </Button>
              <ThemeToggle />
              <Button type="button" variant="ghost" size="icon" className="h-9 w-9" onClick={onLogout} aria-label="Logout">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}

      <NewDirectMessageDialog open={newDmOpen} onClose={() => setNewDmOpen(false)} />
      <CreateGroupDialog open={createGroupOpen} onClose={() => setCreateGroupOpen(false)} />
    </aside>
  );
}
