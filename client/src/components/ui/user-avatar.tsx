import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { userAvatarUrl } from "@/lib/avatar-url";
import { getAvatarColor, getInitials } from "@/lib/format";
import { presenceStatusColor } from "@/lib/presence";
import type { UserStatus } from "@/pages/chat/store/chat-store";

type UserAvatarProps = {
  name: string;
  imageUrl?: string | null;
  className?: string;
  showOnline?: boolean;
  online?: boolean;
  status?: UserStatus;
};

export const UserAvatar = ({ name, imageUrl, className, showOnline, online, status }: UserAvatarProps) => {
  const src = userAvatarUrl(name, imageUrl);
  const resolvedStatus: UserStatus | undefined = showOnline
    ? status ?? (online === false ? "offline" : online === true ? "online" : undefined)
    : undefined;

  return (
    <div className={cn("relative shrink-0", className)}>
      <Avatar className="h-10 w-10">
        <AvatarImage src={src} alt={name} className="object-cover" />
        <AvatarFallback className={cn("text-xs text-white", getAvatarColor(name))}>
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>
      {resolvedStatus && (
        <span
          className={cn(
            "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-sidebar",
            presenceStatusColor(resolvedStatus),
          )}
        />
      )}
    </div>
  );
};
