import type { StateCreator } from "zustand";
import type { AuthState } from "@/pages/auth/store/auth-types";

export type AuthSessionSlice = Pick<AuthState, "setSession" | "clearSession">;

export const createAuthSessionSlice: StateCreator<AuthState, [], [], AuthSessionSlice> = (set, get) => ({
  setSession: (username, token, email = "", profileImage?: string) => {
    set({
      token,
      username,
      email: email || get().email,
      profileImage: profileImage !== undefined ? profileImage : get().profileImage,
      isAuthenticated: !!token,
    });
  },

  clearSession: () => {
    set({ token: "", username: "", email: "", profileImage: "", isAuthenticated: false });
  },
});
