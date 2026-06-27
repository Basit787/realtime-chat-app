import { Info, Phone, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { GroupAvatar } from "@/components/ui/group-avatar";
import { conversationToRoom } from "@/lib/rooms";
import { cn } from "@/lib/utils";
import { effectivePresenceStatus, presenceStatusLabel } from "@/lib/presence";
import { useChatRoom } from "@/pages/chat/context/ChatRoomContext";
import { useChatStore } from "@/pages/chat/store/chat-store";

export const ChatHeader = () => {
  const { username, inCall, isGroup, actions, showGroupInfo, groupCall } = useChatRoom();
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const groups = useChatStore((s) => s.groups);
  const onlineUsers = useChatStore((s) => s.onlineUsers);
  const userStatuses = useChatStore((s) => s.userStatuses);
  const typingUser = useChatStore((s) => s.typingUser);
  const typingRoom = useChatStore((s) => s.typingRoom);
  const activeRoom = conversationToRoom(activeConversationId, username);

  const isChannel = activeConversationId === "general";
  const group = groups.find((g) => g.room === activeConversationId);
  const isCustomGroup = !!group;
  const displayName = isChannel ? "General" : group?.name ?? activeConversationId;
  const peerStatus = !isChannel && !isCustomGroup
    ? effectivePresenceStatus(activeConversationId, onlineUsers, userStatuses)
    : undefined;
  const isTypingHere = typingUser && typingRoom === activeRoom;
  const hasActiveGroupCall = !!groupCall.roomCall;

  const subtitle = isTypingHere
    ? `${typingUser} is typing…`
    : isChannel
      ? `${onlineUsers.length} members online`
      : isCustomGroup
        ? `${group.members.length} members`
        : peerStatus
          ? presenceStatusLabel(peerStatus)
          : "Offline";

  return (
    <header className="flex items-center justify-between border-b border-border px-5 py-4">
      <div className="flex items-center gap-3">
        {isCustomGroup && group ? (
          <GroupAvatar groupId={group.id} name={group.name} imageUrl={group.image} />
        ) : (
          <UserAvatar
            name={displayName}
            showOnline={!isChannel && !isCustomGroup}
            status={peerStatus}
          />
        )}
        <div>
          <h2 className="text-sm font-semibold">{isChannel ? `# ${displayName}` : displayName}</h2>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {!isChannel && peerStatus && peerStatus !== "offline" && (
              <span className={cn("h-1.5 w-1.5 rounded-full", peerStatus === "online" ? "bg-online" : peerStatus === "away" ? "bg-amber-400" : "bg-destructive")} />
            )}
            {subtitle}
            {hasActiveGroupCall && !inCall && (
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] text-primary">Call active</span>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="ghost"
          className="h-9 w-9 rounded-full p-0"
          onClick={actions.startAudioCall}
          disabled={inCall}
          aria-label={isGroup ? "Group audio call" : "Audio call"}
          title={isGroup ? "Start or join group audio call" : "Audio call"}
        >
          <Phone className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-9 w-9 rounded-full p-0"
          onClick={actions.startVideoCall}
          disabled={inCall}
          aria-label={isGroup ? "Group video call" : "Video call"}
          title={isGroup ? "Start or join group video call" : "Video call"}
        >
          <Video className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-9 w-9 rounded-full p-0"
          onClick={showGroupInfo ? actions.openGroupInfo : undefined}
          disabled={!showGroupInfo}
          aria-label="Conversation info"
        >
          <Info className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
};
