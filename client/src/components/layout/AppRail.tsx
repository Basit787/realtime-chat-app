import { MessageCircle, Phone, Users, type LucideIcon } from "lucide-react";
import { UserAvatar } from "@/components/avatar/user-avatar";
import { useAuthStore } from "@/lib/auth-store";
import { usePresenceStatus } from "@/features/profile/hooks";
import { useChatStore, type SidebarView } from "@/features/chat/store/chat-store";
import { cn } from "@/lib/utils";

const ITEMS: { view: SidebarView; label: string; icon: LucideIcon }[] = [
  { view: "conversations", label: "Chat", icon: MessageCircle },
  { view: "groups", label: "Groups", icon: Users },
  { view: "calls", label: "Calls", icon: Phone },
];

type RailButtonProps = {
  label: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  badge?: number;
};

// One app in the rail: icon over label, with the active bar on the left edge
const RailButton = ({ label, active, onClick, children, badge }: RailButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    aria-current={active ? "page" : undefined}
    className={cn(
      "group relative flex h-14 w-full flex-col items-center justify-center gap-0.5 text-[10px] transition-colors",
      active ? "font-semibold text-rail-active" : "text-rail-foreground hover:text-rail-active",
    )}
  >
    <span
      className={cn(
        "absolute top-2 bottom-2 left-0 w-[3px] rounded-r-full bg-rail-active transition-opacity",
        active ? "opacity-100" : "opacity-0",
      )}
    />
    <span className="relative flex h-8 w-8 items-center justify-center rounded-md group-hover:bg-rail-hover">
      {children}
      {!!badge && (
        <span className="absolute -top-1 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-busy px-1 text-[9px] font-bold text-white">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </span>
    {label}
  </button>
);

// Vertical app bar on desktop: Chat, Groups, Calls, and the profile at the bottom
export const AppRail = ({ className }: { className?: string }) => {
  const username = useAuthStore((s) => s.username);
  const profileImage = useAuthStore((s) => s.profileImage);
  const sidebarView = useChatStore((s) => s.sidebarView);
  const setSidebarView = useChatStore((s) => s.setSidebarView);
  const unreadByConversation = useChatStore((s) => s.unreadByConversation);
  const { userStatus } = usePresenceStatus();
  const unread = Object.values(unreadByConversation).reduce((sum, count) => sum + count, 0);

  return (
    <nav aria-label="Apps" className={cn("flex w-[68px] shrink-0 flex-col bg-rail py-1", className)}>
      {ITEMS.map(({ view, label, icon: Icon }) => (
        <RailButton
          key={view}
          label={label}
          active={sidebarView === view}
          onClick={() => setSidebarView(view)}
          badge={view === "conversations" ? unread : undefined}
        >
          <Icon className="h-5 w-5" strokeWidth={sidebarView === view ? 2.25 : 1.75} />
        </RailButton>
      ))}
      <div className="mt-auto">
        <RailButton label="Profile" active={sidebarView === "profile"} onClick={() => setSidebarView("profile")}>
          <UserAvatar
            name={username}
            imageUrl={profileImage}
            showOnline
            status={userStatus}
            className="h-7 w-7"
            fallbackClassName="text-[10px]"
          />
        </RailButton>
      </div>
    </nav>
  );
};
