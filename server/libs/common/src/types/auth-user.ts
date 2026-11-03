export type Role = "user" | "admin";

export const ROLES = { USER: "user" as Role, ADMIN: "admin" as Role };

export interface AuthUser {
  id: string;
  role: Role;
  username: string;
}

export type PresenceStatus = "online" | "away" | "busy" | "offline";
