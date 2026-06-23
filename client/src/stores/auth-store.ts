import { create } from "zustand";
import { authClient, clearAuth, getAuthName, getAuthToken, setAuthName, setAuthToken } from "@/lib/auth-client";

type AuthState = {
  token: string;
  username: string;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  register: (email: string, password: string, name: string) => Promise<string | null>;
  logout: () => Promise<void>;
  hydrate: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: getAuthToken(),
  username: getAuthName(),
  isAuthenticated: !!getAuthToken(),

  hydrate: () => {
    const token = getAuthToken();
    set({ token, username: getAuthName(), isAuthenticated: !!token });
  },

  login: async (email, password) => {
    const { data, error } = await authClient.signIn.email({ email, password });
    if (error) return error.message ?? "Login failed";
    const name = data.user.name;
    setAuthName(name);
    set({ token: getAuthToken(), username: name, isAuthenticated: true });
    return null;
  },

  register: async (email, password, name) => {
    const { data, error } = await authClient.signUp.email({ email, password, name });
    if (error) return error.message ?? "Registration failed";
    const displayName = data.user.name;
    setAuthName(displayName);
    set({ token: getAuthToken(), username: displayName, isAuthenticated: true });
    return null;
  },

  logout: async () => {
    await authClient.signOut();
    clearAuth();
    set({ token: "", username: "", isAuthenticated: false });
  },
}));
