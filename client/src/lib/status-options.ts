import type { UserStatus } from "@/features/chat/store/chat-store";

export const STATUS_OPTIONS: { value: UserStatus; label: string; color: string }[] = [
  { value: "online", label: "Online", color: "bg-online" },
  { value: "away", label: "Away", color: "bg-away" },
  { value: "busy", label: "Busy", color: "bg-busy" },
  { value: "offline", label: "Offline", color: "bg-muted-foreground/50" },
];
