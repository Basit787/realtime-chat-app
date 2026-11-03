import { useState } from "react";
import { MobileBottomNav } from "#/common";
import { Hash, MessageCircle, Palette, Phone, Search, SquarePen, UserRound, Users } from "lucide-react";
import {
  Input,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  ScrollArea,
} from "#/ui";
import { UserAvatar } from "@/components/avatar/user-avatar";
import { ConversationItem } from "@/components/chat/ConversationItem";
import { GroupAvatar } from "@/components/avatar/group-avatar";
import { CreateGroupDialog } from "@/components/chat/CreateGroupDialog";
import { NewDirectMessageDialog } from "@/components/chat/NewDirectMessageDialog";
import { ProfileSection } from "@/components/profile/ProfileSection";
import { CallHistorySection } from "@/components/call/CallHistorySection";
import { useAuthStore } from "@/lib/auth-store";
import { usePresenceStatus } from "@/features/profile/hooks";
import { buildConversations, useChatStore } from "@/features/chat/store/chat-store";
import { cn } from "@/lib/utils";

type ConversationSidebarProps = {
  onLogout: () => void;
};

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
  const mobileChatOpen = useChatStore((s) => s.mobileChatOpen);
  const userStatuses = useChatStore((s) => s.userStatuses);
  const unreadByConversation = useChatStore((s) => s.unreadByConversation);
  const searchQuery = useChatStore((s) => s.searchQuery);
  const { userStatus } = usePresenceStatus();
  const setActiveConversation = useChatStore((s) => s.setActiveConversation);
  const setSidebarView = useChatStore((s) => s.setSidebarView);
  const setSearchQuery = useChatStore((s) => s.setSearchQuery);

  const [newDmOpen, setNewDmOpen] = useState(false);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);

  const conversations = buildConversations(
    messages,
    onlineUsers,
    username,
    groups,
    callHistory,
    knownContacts,
    userStatuses,
    unreadByConversation,
  )
    .filter((c) => sidebarView !== "groups" || c.type !== "dm")
    .filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const groupsOnly = sidebarView === "groups";
  const overlayView = sidebarView === "profile" || sidebarView === "calls";
  const mobileNav = [
    { view: "conversations", label: "Chat", icon: MessageCircle },
    { view: "groups", label: "Groups", icon: Users },
    { view: "calls", label: "Calls", icon: Phone },
  ] as const;

  return (
    <aside
      className={cn(
        "flex h-full min-h-0 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
        "w-full md:w-[300px] lg:w-[320px]",
        overlayView && "max-md:fixed max-md:inset-0 max-md:z-20",
        mobileChatOpen && !overlayView && "max-md:hidden",
      )}
    >
      <div className="flex min-h-0 flex-1 flex-col">
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
            <div className="flex h-14 w-full shrink-0 items-center justify-between gap-2 px-4">
              <div className="flex min-w-0 items-center gap-3">
                {/* Phones have no app rail: the avatar opens the profile */}
                <button
                  type="button"
                  onClick={() => setSidebarView("profile")}
                  className="shrink-0 rounded-full md:hidden"
                  aria-label="Profile"
                >
                  <UserAvatar
                    name={username}
                    imageUrl={profileImage}
                    showOnline
                    status={userStatus}
                    className="h-8 w-8"
                  />
                </button>
                <h1 className="truncate text-lg font-bold">{groupsOnly ? "Groups" : "Chat"}</h1>
              </div>
              {groupsOnly ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => setCreateGroupOpen(true)}
                  aria-label="Create group"
                  title="Create group"
                >
                  <SquarePen className="h-4 w-4" />
                </Button>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      aria-label="New chat"
                      title="New chat"
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
                      New chat
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault();
                        setCreateGroupOpen(true);
                      }}
                    >
                      <Users className="mr-2 h-4 w-4" />
                      New group
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Desktop searches from the top bar */}
            <div className="shrink-0 px-4 pb-2 md:hidden">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 rounded-md pl-9"
                />
              </div>
            </div>

            <p className="shrink-0 px-5 pt-1 pb-1 text-xs font-semibold text-muted-foreground">
              {searchQuery ? "Results" : "Recent"}
            </p>

            <ScrollArea className="min-h-0 flex-1 px-2">
              <div className="space-y-px pb-2">
                {conversations.length === 0 && (
                  <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                    {searchQuery ? "No matches" : groupsOnly ? "No groups yet" : "No chats yet"}
                  </p>
                )}
                {conversations.map((conversation) => (
                  <ConversationItem
                    key={conversation.id}
                    conversation={conversation}
                    active={activeConversationId === conversation.id}
                    onClick={() => setActiveConversation(conversation.id)}
                    icon={
                      conversation.type === "channel" ? (
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/15">
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
                              className="h-8 w-8"
                            />
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent">
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
          </>
        )}
      </div>

      <MobileBottomNav
        className="bg-sidebar"
        items={mobileNav.map(({ view, label, icon: Icon }) => ({
          key: view,
          label,
          icon: <Icon />,
          active: sidebarView === view,
          onSelect: () => setSidebarView(view),
        }))}
      />

      <NewDirectMessageDialog open={newDmOpen} onClose={() => setNewDmOpen(false)} />
      <CreateGroupDialog open={createGroupOpen} onClose={() => setCreateGroupOpen(false)} />
    </aside>
  );
};
