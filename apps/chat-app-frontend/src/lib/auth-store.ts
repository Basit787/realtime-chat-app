import type { AuthSnapshot } from "frontend-common";
import { create } from "zustand";
import { authClient } from "@/lib/auth";

type AuthState = {
  token: string;
  userId: string;
  username: string;
  email: string;
  profileImage: string;
  isAuthenticated: boolean;
};

const fromSnapshot = ({ user, accessToken, status }: AuthSnapshot): AuthState => ({
  token: accessToken,
  userId: user?.id ?? "",
  username: user?.name ?? "",
  email: user?.email ?? "",
  profileImage: authClient.avatarUrl(user?.image) ?? "",
  isAuthenticated: status === "signedIn" && !!user,
});

// Read-only mirror of the auth client, for components and non-React code that read the signed-in user
export const useAuthStore = create<AuthState>()(() => fromSnapshot(authClient.getSnapshot()));

authClient.subscribe(() => useAuthStore.setState(fromSnapshot(authClient.getSnapshot())));
