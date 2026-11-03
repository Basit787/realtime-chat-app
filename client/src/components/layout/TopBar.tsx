import { Search } from "lucide-react";
import { UserMenu } from "#/common";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  Input,
} from "#/ui";
import { ChatWaveLogo } from "@/components/brand/ChatWaveLogo";
import { usePresenceStatus } from "@/features/profile/hooks";
import { useChatStore } from "@/features/chat/store/chat-store";
import { STATUS_OPTIONS } from "@/lib/status-options";
import { cn } from "@/lib/utils";

// Desktop title bar: brand on the left, search in the middle, presence and the account menu on the right
export const TopBar = ({ className }: { className?: string }) => {
  const searchQuery = useChatStore((s) => s.searchQuery);
  const setSearchQuery = useChatStore((s) => s.setSearchQuery);
  const setSidebarView = useChatStore((s) => s.setSidebarView);
  const sidebarView = useChatStore((s) => s.sidebarView);
  const { userStatus, changeStatus } = usePresenceStatus();
  const currentStatus = STATUS_OPTIONS.find((s) => s.value === userStatus) ?? STATUS_OPTIONS[0];

  return (
    <header
      className={cn(
        "grid h-12 shrink-0 grid-cols-[1fr_minmax(0,560px)_1fr] items-center gap-4 bg-rail px-3",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <ChatWaveLogo className="h-6 w-6" />
        <span className="truncate text-sm font-semibold">ChatWave</span>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            // Results show in the conversation list
            if (sidebarView === "profile" || sidebarView === "calls") setSidebarView("conversations");
          }}
          className="h-8 rounded-md border-transparent bg-background pl-9 text-sm shadow-none focus-visible:border-primary focus-visible:ring-0"
        />
      </div>

      <div className="flex items-center justify-end gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="sm" className="h-8 gap-2 px-2 text-xs font-normal">
              <span className={cn("h-2.5 w-2.5 rounded-full", currentStatus.color)} />
              {currentStatus.label}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Set status</DropdownMenuLabel>
            {STATUS_OPTIONS.map((option) => (
              <DropdownMenuItem key={option.value} onClick={() => void changeStatus(option.value)}>
                <span className={cn("mr-2 h-2.5 w-2.5 rounded-full", option.color)} />
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <UserMenu />
      </div>
    </header>
  );
};
