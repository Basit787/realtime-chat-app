import { format, isToday, isYesterday, isThisWeek } from "date-fns";

export function getInitials(name: string) {
  return name
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const AVATAR_COLORS = [
  "bg-cyan-600",
  "bg-teal-600",
  "bg-emerald-600",
  "bg-sky-600",
  "bg-indigo-600",
  "bg-violet-600",
  "bg-rose-600",
  "bg-amber-600",
];

export function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function formatMessageTime(iso: string) {
  const date = new Date(iso);
  return format(date, "h:mm a");
}

export function formatConversationTime(iso?: string) {
  if (!iso) return "";
  const date = new Date(iso);
  if (isToday(date)) return format(date, "h:mm a");
  if (isYesterday(date)) return "Yesterday";
  if (isThisWeek(date)) return format(date, "EEE");
  return format(date, "MMM d");
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
