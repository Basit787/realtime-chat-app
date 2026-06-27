import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getAvatarColor, getInitials } from "@/lib/format";

type UserAvatarProps = {
  name: string;
  className?: string;
  showOnline?: boolean;
  online?: boolean;
};

export function UserAvatar({ name, className, showOnline, online }: UserAvatarProps) {
  return (
    <div className={cn("relative shrink-0", className)}>
      <Avatar className="h-10 w-10">
        <AvatarFallback className={cn("text-xs text-white", getAvatarColor(name))}>{getInitials(name)}</AvatarFallback>
      </Avatar>
      {showOnline && (
        <span
          className={cn(
            "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-sidebar",
            online ? "bg-online" : "bg-muted-foreground/50",
          )}
        />
      )}
    </div>
  );
}
