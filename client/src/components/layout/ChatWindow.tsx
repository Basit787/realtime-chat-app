import { useMemo, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageInput } from "@/components/chat/MessageInput";
import { MessageList } from "@/components/chat/MessageList";
import { CallOverlay } from "@/components/call/CallOverlay";
import { useMessages } from "@/hooks/useMessages";
import { useSocket } from "@/hooks/useSocket";
import { useWebRTC } from "@/hooks/useWebRTC";
import { filterMessagesForConversation, useChatStore } from "@/stores/chat-store";
import { useAuthStore } from "@/stores/auth-store";

export function ChatWindow() {
  const username = useAuthStore((s) => s.username);
  const messages = useChatStore((s) => s.messages);
  const activeConversationId = useChatStore((s) => s.activeConversationId);

  useMessages();
  const socket = useSocket();
  const webrtc = useWebRTC({ socket, selfUsername: username, enabled: !!socket });

  const bottomRef = useRef<HTMLDivElement>(null);

  const visibleMessages = useMemo(
    () => filterMessagesForConversation(messages, activeConversationId, username),
    [messages, activeConversationId, username],
  );

  const callPeer =
    activeConversationId !== "general" ? activeConversationId : null;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleMessages.length]);

  return (
    <main className="relative flex min-w-0 flex-1 flex-col bg-background/50">
      <ChatHeader
        onAudioCall={() => callPeer && webrtc.startCall(callPeer, "audio")}
        onVideoCall={() => callPeer && webrtc.startCall(callPeer, "video")}
        inCall={webrtc.inCall}
      />

      <CallOverlay
        incomingCall={webrtc.incomingCall}
        inCall={webrtc.inCall}
        callPeer={webrtc.callPeer}
        localStream={webrtc.localStream}
        remoteStream={webrtc.remoteStream}
        onAccept={() => webrtc.acceptCall()}
        onReject={() => webrtc.rejectCall()}
        onEnd={() => webrtc.endCall()}
      />

      <ScrollArea className="flex-1">
        <MessageList messages={visibleMessages} selfUsername={username} />
        <div ref={bottomRef} />
      </ScrollArea>

      <MessageInput socket={socket} />
    </main>
  );
}
