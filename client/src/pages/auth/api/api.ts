import { apiClient } from "@/lib/axios";
import { createApiError } from "@/lib/api-errors";
import { authEndpoints } from "./endpoint";
import { profileEndpoints } from "./profile-endpoint";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
};

export type AuthSession = {
  user: AuthUser;
  token: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
  name: string;
};

export type PresenceStatus = "online" | "away" | "busy" | "offline";

const parseAuthSession = (user: AuthUser, token: string): AuthSession => {
  if (!token) {
    throw new Error("Auth response did not include a token");
  }
  return { user, token };
}

export const loginWithEmail = async (payload: LoginPayload): Promise<AuthSession> => {
  const response = await apiClient.postForAuth<AuthUser>(authEndpoints.login(), payload);
  if (!response.ok) {
    throw createApiError(response.message ?? "Failed to login", response.status);
  }
  return parseAuthSession(response.data.user, response.data.token);
};

export const registerWithEmail = async (payload: RegisterPayload): Promise<AuthSession> => {
  const response = await apiClient.postForAuth<AuthUser>(authEndpoints.register(), payload);
  if (!response.ok) {
    throw createApiError(response.message ?? "Failed to register", response.status);
  }
  return parseAuthSession(response.data.user, response.data.token);
};

export const logoutSession = async (): Promise<void> => {
  const response = await apiClient.post<null>(authEndpoints.logout());
  if (!response.ok) {
    throw createApiError(response.message ?? "Failed to logout", response.status);
  }
};

export const fetchSession = async (): Promise<AuthUser | null> => {
  const response = await apiClient.get<{ user: AuthUser | null }>(authEndpoints.session());
  if (!response.ok) {
    throw createApiError(response.message ?? "Failed to load session", response.status);
  }
  return response.data.user;
};

export const updateProfile = async (name: string): Promise<AuthUser> => {
  const response = await apiClient.post<{ user: AuthUser }>(authEndpoints.updateUser(), { name });
  if (!response.ok) {
    throw createApiError(response.message ?? "Failed to update profile", response.status);
  }
  return response.data.user;
};

export const changeEmail = async (newEmail: string): Promise<void> => {
  const response = await apiClient.post<null>(authEndpoints.changeEmail(), {
    newEmail,
    callbackURL: window.location.origin,
  });
  if (!response.ok) {
    throw createApiError(response.message ?? "Failed to update email", response.status);
  }
};

export const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  const response = await apiClient.post<null>(authEndpoints.changePassword(), {
    currentPassword,
    newPassword,
    revokeOtherSessions: true,
  });
  if (!response.ok) {
    throw createApiError(response.message ?? "Failed to change password", response.status);
  }
};

export const deleteAccount = async (password: string): Promise<void> => {
  const response = await apiClient.post<null>(authEndpoints.deleteUser(), { password });
  if (!response.ok) {
    throw createApiError(response.message ?? "Failed to delete account", response.status);
  }
};

export const uploadProfilePhoto = async (file: File): Promise<string> => {
  const body = new FormData();
  body.append("photo", file);
  const response = await apiClient.postForm<{ image: string }>(profileEndpoints.avatar(), body);
  if (!response.ok) {
    throw createApiError(response.message ?? "Failed to upload photo", response.status);
  }
  return response.data.image;
};

export const removeProfilePhoto = async (): Promise<void> => {
  const response = await apiClient.delete<null>(profileEndpoints.avatar());
  if (!response.ok) {
    throw createApiError(response.message ?? "Failed to remove photo", response.status);
  }
};

export const fetchPresenceStatus = async (): Promise<PresenceStatus> => {
  const response = await apiClient.get<{ status: PresenceStatus }>(profileEndpoints.status());
  if (!response.ok) {
    throw createApiError(response.message ?? "Failed to load status", response.status);
  }
  return response.data.status;
};

export const updatePresenceStatus = async (status: PresenceStatus): Promise<PresenceStatus> => {
  const response = await apiClient.patch<{ status: PresenceStatus }>(profileEndpoints.status(), { status });
  if (!response.ok) {
    throw createApiError(response.message ?? "Failed to update status", response.status);
  }
  return response.data.status;
};
