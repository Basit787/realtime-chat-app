export type AuthState = {
  token: string;
  username: string;
  email: string;
  profileImage: string;
  isAuthenticated: boolean;
  setSession: (username: string, token: string, email?: string, profileImage?: string) => void;
  setProfileImage: (image: string) => void;
  clearSession: () => void;
};
