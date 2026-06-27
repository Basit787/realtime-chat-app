import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { groupAvatarUrl } from "@/lib/avatar-url";
import { getAvatarColor, getInitials } from "@/lib/format";

type GroupAvatarProps = {
  groupId: string;
  name: string;
  imageUrl?: string | null;
  className?: string;
};

export const GroupAvatar = ({ groupId, name, imageUrl, className }: GroupAvatarProps) => {
  const src = imageUrl ? groupAvatarUrl(groupId, imageUrl) : undefined;

  return (
    <div className={cn("relative shrink-0", className)}>
      <Avatar className="h-10 w-10">
        {src ? <AvatarImage src={src} alt={name} className="object-cover" /> : null}
        <AvatarFallback className={cn("text-xs text-white", getAvatarColor(name))}>
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>
    </div>
  );
};
