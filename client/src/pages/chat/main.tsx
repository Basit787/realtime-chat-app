import { useState } from "react";
import { LogOut } from "lucide-react";
import { ChatWindow } from "@/components/layout/ChatWindow";
import { ConversationSidebar } from "@/components/layout/ConversationSidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useAuth } from "@/pages/auth/api/hooks";
import { useChatStore } from "@/pages/chat/store/chat-store";

const ChatPage = () => {
  const { username, logout } = useAuth();
  const resetChat = useChatStore((s) => s.reset);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const handleLogout = async () => {
    await logout.mutateAsync();
    resetChat();
    setLogoutOpen(false);
  };

  return (
    <div className="flex h-dvh min-h-0 overflow-hidden bg-background">
      <ConversationSidebar onLogout={() => setLogoutOpen(true)} />
      <ChatWindow />

      <div className="absolute right-4 top-4 z-30 flex items-center gap-1 md:hidden">
        <ThemeToggle />
        <span className="text-xs text-muted-foreground">{username}</span>
        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setLogoutOpen(true)}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>

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
