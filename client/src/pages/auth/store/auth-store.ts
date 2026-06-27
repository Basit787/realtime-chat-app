import { create } from "zustand";

const AUTH_TOKEN_KEY = "auth_token";
const AUTH_NAME_KEY = "auth_name";

export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY) || "";
}

export function getAuthName() {
  return localStorage.getItem(AUTH_NAME_KEY) || "";
}

export function setAuthToken(token: string) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function setAuthName(name: string) {
  localStorage.setItem(AUTH_NAME_KEY, name);
}

export function clearAuth() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_NAME_KEY);
}

type AuthState = {
  token: string;
  username: string;
  isAuthenticated: boolean;
  setSession: (username: string, token: string) => void;
  clearSession: () => void;
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

  setSession: (username, token) => {
    setAuthToken(token);
    setAuthName(username);
    set({ token, username, isAuthenticated: true });
  },

  clearSession: () => {
    clearAuth();
    set({ token: "", username: "", isAuthenticated: false });
  },
}));
