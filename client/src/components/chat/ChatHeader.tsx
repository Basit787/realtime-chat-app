import { Phone, SquareCheck, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { GroupAvatar } from "@/components/ui/group-avatar";
import { conversationToRoom } from "@/lib/rooms";
import { effectivePresenceStatus, presenceStatusLabel } from "@/lib/presence";
import { useUserProfileImage } from "@/lib/use-user-profile-image";
import { useChatRoom } from "@/pages/chat/context/ChatRoomContext";
import { useChatStore } from "@/pages/chat/store/chat-store";

export const ChatHeader = () => {
  const { username, inCall, isGroup, actions, groupCall } = useChatRoom();
  const messageSelectionMode = useChatStore((s) => s.messageSelectionMode);
  const enterMessageSelection = useChatStore((s) => s.enterMessageSelection);
  const exitMessageSelection = useChatStore((s) => s.exitMessageSelection);
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
  const hasActiveGroupCall = groupCall.roomCall?.room === activeRoom;
  const peerProfileImage = useUserProfileImage(displayName);

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
            imageUrl={!isChannel && !isCustomGroup ? peerProfileImage : undefined}
            showOnline={!isChannel && !isCustomGroup}
            status={peerStatus}
          />
        )}
        <div>
          <h2 className="text-sm font-semibold">{isChannel ? `# ${displayName}` : displayName}</h2>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
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
          variant={messageSelectionMode ? "secondary" : "ghost"}
          className="h-9 w-9 rounded-full p-0"
          onClick={() => (messageSelectionMode ? exitMessageSelection() : enterMessageSelection())}
          aria-label={messageSelectionMode ? "Cancel message selection" : "Select messages"}
          title={messageSelectionMode ? "Cancel selection" : "Select messages"}
        >
          <SquareCheck className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-9 w-9 rounded-full p-0"
          onClick={actions.startAudioCall}
          disabled={inCall || messageSelectionMode || (isGroup && !isCustomGroup)}
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
          disabled={inCall || messageSelectionMode || (isGroup && !isCustomGroup)}
          aria-label={isGroup ? "Group video call" : "Video call"}
          title={isGroup ? "Start or join group video call" : "Video call"}
        >
          <Video className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
};
