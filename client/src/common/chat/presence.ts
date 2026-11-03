import type { UserStatus } from "./types";

export const effectivePresenceStatus = (
  username: string,
  onlineUsers: string[],
  userStatuses: Record<string, UserStatus>,
): UserStatus => {
  if (!onlineUsers.includes(username)) return "offline";
  return userStatuses[username] ?? "online";
};

export const presenceStatusColor = (status: UserStatus) => {
  switch (status) {
    case "online":
      return "bg-online";
    case "away":
      return "bg-away";
    case "busy":
      return "bg-busy";
    default:
      return "bg-muted-foreground/50";
  }
};

export const presenceStatusLabel = (status: UserStatus) => {
  switch (status) {
    case "online":
      return "Online";
    case "away":
      return "Away";
    case "busy":
      return "Busy";
    default:
      return "Offline";
  }
};
