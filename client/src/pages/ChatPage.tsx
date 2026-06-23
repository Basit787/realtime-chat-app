import { LogOut } from "lucide-react";
import { BrandPanel } from "@/components/layout/BrandPanel";
import { ChatWindow } from "@/components/layout/ChatWindow";
import { ConversationSidebar } from "@/components/layout/ConversationSidebar";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { useChatStore } from "@/stores/chat-store";

export default function ChatPage() {
  const username = useAuthStore((s) => s.username);
  const logout = useAuthStore((s) => s.logout);
  const resetChat = useChatStore((s) => s.reset);

  const handleLogout = async () => {
    await logout();
    resetChat();
  };

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <BrandPanel />

      <div className="flex min-w-0 flex-1 p-2 sm:p-3 md:p-4">
        <div className="flex min-w-0 flex-1 overflow-hidden rounded-2xl border border-border/40 bg-card/10 shadow-[0_8px_40px_rgba(0,0,0,0.45)]">
          <ConversationSidebar onLogout={() => void handleLogout()} />
          <ChatWindow />
        </div>
      </div>

      <div className="absolute right-4 top-4 z-30 flex items-center gap-2 md:hidden">
        <span className="text-xs text-muted-foreground">{username}</span>
        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => void handleLogout()}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
