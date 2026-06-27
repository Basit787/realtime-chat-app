import { LogOut } from "lucide-react";
import { BrandPanel } from "@/components/layout/BrandPanel";
import { ChatWindow } from "@/components/layout/ChatWindow";
import { ConversationSidebar } from "@/components/layout/ConversationSidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/pages/auth/api/hooks";
import { useChatStore } from "@/pages/chat/store/chat-store";

export default function ChatPage() {
  const { username, logout } = useAuth();
  const resetChat = useChatStore((s) => s.reset);

  const handleLogout = async () => {
    await logout.mutateAsync();
    resetChat();
  };

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <BrandPanel />

      <div className="flex min-w-0 flex-1 p-2 sm:p-3 md:p-4">
        <div className="flex min-w-0 flex-1 overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
          <ConversationSidebar onLogout={() => void handleLogout()} />
          <ChatWindow />
        </div>
      </div>

      <div className="absolute right-4 top-4 z-30 flex items-center gap-1 md:hidden">
        <ThemeToggle />
        <span className="text-xs text-muted-foreground">{username}</span>
        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => void handleLogout()}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
