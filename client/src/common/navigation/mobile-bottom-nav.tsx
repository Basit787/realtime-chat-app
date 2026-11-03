import { UserRound } from "lucide-react";
import { cn } from "#/ui";
import { useState } from "react";
import type { MobileNavItem } from "./mobile-nav-item";
import { ProfileScreen } from "./profile-screen";

type MobileBottomNavProps = {
  items: MobileNavItem[];
  className?: string;
};

const cell = "flex flex-col items-center justify-center gap-0.5 py-2 text-xs [&_svg]:size-5";

// Bottom tab bar on phones: the app's tabs and Profile; hidden from md up
export const MobileBottomNav = ({ items, className }: MobileBottomNavProps) => {
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <>
      {profileOpen && (
        <ProfileScreen className="fixed inset-0 z-40 pb-[calc(4rem+env(safe-area-inset-bottom))] md:hidden" />
      )}
      <nav
        className={cn(
          "shrink-0 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden",
          className,
          profileOpen && "z-50",
        )}
      >
        <div className="grid auto-cols-fr grid-flow-col">
          {items.map((item) => {
            const active = item.active && !profileOpen;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  item.onSelect();
                }}
                aria-current={active ? "page" : undefined}
                className={cn(cell, active ? "text-primary" : "text-muted-foreground")}
              >
                <span className="relative">
                  {item.icon}
                  {!!item.badge && (
                    <span className="absolute -top-1.5 -right-3 min-w-4 rounded-full bg-primary px-1 text-center text-[10px] leading-4 text-primary-foreground">
                      {item.badge}
                    </span>
                  )}
                </span>
                {item.label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            aria-current={profileOpen ? "page" : undefined}
            className={cn(cell, profileOpen ? "text-primary" : "text-muted-foreground")}
          >
            <UserRound />
            Profile
          </button>
        </div>
      </nav>
    </>
  );
};
