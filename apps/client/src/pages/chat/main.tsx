import { useState } from "react";
import { ChatWindow } from "@/components/layout/ChatWindow";
import { ConversationSidebar } from "@/components/layout/ConversationSidebar";
import { Button, Dialog } from "@chat/ui";
import { useAuth } from "@/pages/auth/api/hooks";
import { useChatStore } from "@/pages/chat/store/chat-store";
import { useBackButtonClose } from "@/lib/use-back-close";

const ChatPage = () => {
  const { logout } = useAuth();
  const resetChat = useChatStore((s) => s.reset);
  const mobileChatOpen = useChatStore((s) => s.mobileChatOpen);
  const closeMobileChat = useChatStore((s) => s.closeMobileChat);
  const [logoutOpen, setLogoutOpen] = useState(false);

  // On phones, the system back button/gesture returns from a chat to the conversation list
  useBackButtonClose(mobileChatOpen, closeMobileChat, "mobileChat");

  const handleLogout = async () => {
    await logout.mutateAsync();
    resetChat();
    setLogoutOpen(false);
  };

  return (
    <div className="flex h-dvh min-h-0 overflow-hidden bg-background pt-(--call-bar-h)">
      <ConversationSidebar onLogout={() => setLogoutOpen(true)} />
      <ChatWindow />

      <Dialog open={logoutOpen} onClose={() => setLogoutOpen(false)} title="Log out?" className="max-w-sm">
        <div className="p-4">
          <p className="text-sm text-muted-foreground">Are you sure you want to sign out of ChatWave?</p>
          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setLogoutOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void handleLogout()}
              disabled={logout.isPending}
            >
              {logout.isPending ? "Signing out…" : "Log out"}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default ChatPage;
