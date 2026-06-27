import { Info, Phone, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { conversationToRoom } from "@/lib/rooms";
import { useAuthStore } from "@/pages/auth/store/auth-store";
import { useChatStore } from "@/pages/chat/store/chat-store";

type ChatHeaderProps = {
  onAudioCall: () => void;
  onVideoCall: () => void;
  inCall: boolean;
};

export function ChatHeader({ onAudioCall, onVideoCall, inCall }: ChatHeaderProps) {
  const username = useAuthStore((s) => s.username);
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const onlineUsers = useChatStore((s) => s.onlineUsers);
  const typingUser = useChatStore((s) => s.typingUser);
  const typingRoom = useChatStore((s) => s.typingRoom);
  const activeRoom = conversationToRoom(activeConversationId, username);

  const isChannel = activeConversationId === "general";
  const displayName = isChannel ? "General" : activeConversationId;
  const isOnline = isChannel ? onlineUsers.length > 1 : onlineUsers.includes(activeConversationId);
  const isTypingHere = typingUser && typingRoom === activeRoom;

  const subtitle = isTypingHere
    ? `${typingUser} is typing…`
    : isChannel
      ? `${onlineUsers.length} members online`
      : isOnline
        ? "Online"
        : "Offline";

  return (
    <header className="flex items-center justify-between border-b border-border px-5 py-4">
      <div className="flex items-center gap-3">
        <UserAvatar name={displayName} showOnline={!isChannel} online={isOnline} />
        <div>
          <h2 className="text-sm font-semibold">{isChannel ? `# ${displayName}` : displayName}</h2>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {!isChannel && isOnline && <span className="h-1.5 w-1.5 rounded-full bg-online" />}
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {!isChannel && (
          <>
            <Button
              size="sm"
              variant="ghost"
              className="h-9 w-9 rounded-full p-0"
              onClick={onAudioCall}
              disabled={inCall}
              aria-label="Audio call"
            >
              <Phone className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-9 w-9 rounded-full p-0"
              onClick={onVideoCall}
              disabled={inCall}
              aria-label="Video call"
            >
              <Video className="h-4 w-4" />
            </Button>
          </>
        )}
        <Button size="sm" variant="ghost" className="h-9 w-9 rounded-full p-0" aria-label="Info">
          <Info className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
