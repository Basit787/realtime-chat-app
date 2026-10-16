import type { StateCreator } from "zustand";
import type { AuthState } from "@/pages/auth/store/auth-types";

export type AuthProfileSlice = Pick<AuthState, "setProfileImage">;

export const createAuthProfileSlice: StateCreator<AuthState, [], [], AuthProfileSlice> = (set) => ({
  setProfileImage: (image) => {
    set({ profileImage: image });
  },
});
