import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import {
  fetchSession,
  loginWithEmail,
  logoutSession,
  registerWithEmail,
  type AuthSession,
  type LoginPayload,
  type RegisterPayload,
} from "@/pages/auth/api/api";
import { useAuthStore } from "@/pages/auth/store/auth-store";
import { normalizeAvatarUrl } from "@/lib/avatar-url";
import { useChatStore } from "@/pages/chat/store/chat-store";
import { useMutationToast } from "@/lib/use-mutation-toast";

export const useLogin = (): UseMutationResult<AuthSession, Error, LoginPayload> => {
  const setSession = useAuthStore((s) => s.setSession);
  const { onSuccessNotification, onErrorNotification } = useMutationToast();

  return useMutation({
    mutationFn: loginWithEmail,
    onSuccess: (session) => {
      const name = session.user.name.trim();
      onSuccessNotification(name ? `Welcome back, ${name}` : "Welcome back");
      setSession(session.user.name, session.token, session.user.email, normalizeAvatarUrl(session.user.image) ?? "");
    },
    onError: (err) => onErrorNotification(err, "Login failed"),
  });
};

export const useRegister = (): UseMutationResult<AuthSession, Error, RegisterPayload> => {
  const setSession = useAuthStore((s) => s.setSession);
  const { onSuccessNotification, onErrorNotification } = useMutationToast();

  return useMutation({
    mutationFn: registerWithEmail,
    onSuccess: (session) => {
      onSuccessNotification("Account created successfully");
      setSession(session.user.name, session.token, session.user.email, normalizeAvatarUrl(session.user.image) ?? "");
    },
    onError: (err) => onErrorNotification(err, "Registration failed"),
  });
};

export const useLogout = (): UseMutationResult<void, Error, void> => {
  const queryClient = useQueryClient();
  const clearSession = useAuthStore((s) => s.clearSession);
  const { onSuccessNotification, onErrorNotification } = useMutationToast();

  return useMutation({
    mutationFn: logoutSession,
    onSuccess: () => {
      queryClient.setQueryData(["session"], null);
      queryClient.removeQueries({ queryKey: ["session"] });
      clearSession();
      onSuccessNotification("Signed out successfully");
    },
    onError: (err) => onErrorNotification(err, "Sign out failed"),
  });
};

export const useAuth = () => {
  const token = useAuthStore((s) => s.token);
  const username = useAuthStore((s) => s.username);
  const profileImage = useAuthStore((s) => s.profileImage);
  const email = useAuthStore((s) => s.email);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setSession = useAuthStore((s) => s.setSession);

  const login = useLogin();
  const register = useRegister();
  const logout = useLogout();

  const sessionQuery = useQuery({
    queryKey: ["session"],
    queryFn: fetchSession,
    enabled: isAuthenticated,
    staleTime: 60_000,
  });

  useEffect(() => {
    const user = sessionQuery.data;
    if (!isAuthenticated || !token || !user) return;
    const nextImage = normalizeAvatarUrl(user.image) ?? (user.image === undefined ? profileImage : "");
    if (user.email !== email || user.name !== username || nextImage !== profileImage) {
      setSession(user.name, token, user.email, nextImage);
    }
    if (user.name && nextImage) {
      useChatStore.getState().mergeUserProfileImages({ [user.name]: nextImage });
    }
  }, [sessionQuery.data, email, username, profileImage, token, setSession, isAuthenticated]);

  return { token, username, email, isAuthenticated, login, register, logout, sessionQuery };
};
