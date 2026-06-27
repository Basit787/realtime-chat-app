import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { UserAvatar } from "@/components/ui/user-avatar";
import { buildConversations } from "@/pages/chat/store/chat-store";
import { useChatStore } from "@/pages/chat/store/chat-store";
import { useAuthStore } from "@/pages/auth/store/auth-store";
import type { ChatMessage } from "@/pages/chat/api/api";
import { conversationToRoom } from "@/lib/rooms";
import { formatForwardText } from "@/lib/messages";
import { toastSuccess } from "@/lib/toast";

import type { Socket } from "socket.io-client";

type ForwardDialogProps = {
  open: boolean;
  message: ChatMessage | null;
  socket: Socket | null;
  onClose: () => void;
};

export const ForwardDialog = ({ open, message, socket, onClose }: ForwardDialogProps) => {
  const username = useAuthStore((s) => s.username);
  const messages = useChatStore((s) => s.messages);
  const groups = useChatStore((s) => s.groups);
  const callHistory = useChatStore((s) => s.callHistory);
  const knownContacts = useChatStore((s) => s.knownContacts);
  const onlineUsers = useChatStore((s) => s.onlineUsers);
  const userStatuses = useChatStore((s) => s.userStatuses);
  const setForwardMessage = useChatStore((s) => s.setForwardMessage);

  const conversations = buildConversations(messages, onlineUsers, username, groups, callHistory, knownContacts, userStatuses).filter(
    (c) => conversationToRoom(c.id, username) !== message?.room,
  );

  const handleForward = (conversationId: string) => {
    if (!message || !socket) return;
    const room = conversationToRoom(conversationId, username);
    const text = formatForwardText(message);
    if (message.type === "file") {
      setForwardMessage(message);
      onClose();
      return;
    }
    socket.emit("message", { room, text });
    toastSuccess(`Forwarded to ${conversationId === "general" ? "General" : conversationId}`);
    onClose();
  };

  if (!open || !message) return null;

  return (
    <Dialog open={open} onClose={onClose} title="Forward message" className="max-w-sm">
      <div className="max-h-72 overflow-y-auto p-2">
        {conversations.length === 0 ? (
          <p className="px-2 py-4 text-sm text-muted-foreground">No other conversations</p>
        ) : (
          conversations.map((conversation) => (
            <Button
              key={conversation.id}
              type="button"
              variant="ghost"
              className="h-auto w-full justify-start gap-3 rounded-xl px-3 py-2.5 font-normal"
              onClick={() => handleForward(conversation.id)}
            >
              <UserAvatar name={conversation.name} className="h-9 w-9" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{conversation.name}</p>
                {conversation.lastMessage && (
                  <p className="truncate text-xs text-muted-foreground">{conversation.lastMessage}</p>
                )}
              </div>
            </Button>
          ))
        )}
      </div>
      {message.type === "file" && (
        <p className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
          File attachments can be forwarded by re-uploading from the original chat.
        </p>
      )}
      <div className="border-t border-border p-2">
        <Button type="button" variant="ghost" className="w-full" onClick={onClose}>
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
      </div>
    </Dialog>
  );
}
