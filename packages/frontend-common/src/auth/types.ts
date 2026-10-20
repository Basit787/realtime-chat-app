// The signed-in account as the auth service returns it
export type AuthAccount = {
  id: string;
  name: string;
  email: string;
  image: string;
  role: "user" | "admin";
};

export type AuthStatus = "loading" | "signedOut" | "signedIn";

export type AuthSnapshot = {
  status: AuthStatus;
  user: AuthAccount | null;
  // Short-lived JWT for app APIs; empty while signed out or offline
  accessToken: string;
};

// Key-value store for the session token on native (SecureStore); sync or async
export type AuthStorage = {
  getItem: (key: string) => Promise<string | null> | string | null;
  setItem: (key: string, value: string) => Promise<void> | void;
  removeItem: (key: string) => Promise<void> | void;
};

export type SignInPayload = { email: string; password: string };

export type SignUpPayload = SignInPayload & { name: string };

export type TokenReply = { accessToken: string; expiresAt: number; user: AuthAccount };

export type SessionReply = { authenticated: boolean; user: AuthAccount | null };
