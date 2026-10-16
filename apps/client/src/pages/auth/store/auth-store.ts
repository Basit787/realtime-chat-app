import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createAuthProfileSlice } from "@/pages/auth/store/auth-profile-slice";
import { createAuthSessionSlice } from "@/pages/auth/store/auth-session-slice";
import type { AuthState } from "@/pages/auth/store/auth-types";

export type { AuthState } from "@/pages/auth/store/auth-types";

export const useAuthStore = create<AuthState>()(
  persist(
    (...args) => ({
      token: "",
      username: "",
      email: "",
      profileImage: "",
      isAuthenticated: false,
      ...createAuthSessionSlice(...args),
      ...createAuthProfileSlice(...args),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        token: state.token,
        username: state.username,
        email: state.email,
        profileImage: state.profileImage,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
