export type AuthUser = {
  id: string;
  role: "user" | "admin";
  username: string;
};
