import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { GroupInfoDialog } from "@/components/chat/GroupInfoDialog";
import { MessageInput } from "@/components/chat/MessageInput";
import { MessageList } from "@/components/chat/MessageList";
import { CallOverlay } from "@/components/call/CallOverlay";
import { ChatRoomProvider, useChatRoom } from "@/pages/chat/context/ChatRoomContext";

const ChatWindowContent = () => {
  const { bottomRef } = useChatRoom();

  return (
    <main className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-background/50">
      <ChatHeader />
      <GroupInfoDialog />
      <CallOverlay />
      <ScrollArea className="min-h-0 flex-1">
        <MessageList />
        <div ref={bottomRef} />
      </ScrollArea>
      <MessageInput />
    </main>
  );
};

export const ChatWindow = () => (
  <ChatRoomProvider>
    <ChatWindowContent />
  </ChatRoomProvider>
);
