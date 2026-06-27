import { useMutation } from "@tanstack/react-query";
import { loginWithEmail, logoutSession, registerWithEmail } from "@/pages/auth/api/api";
import { useAuthStore } from "@/pages/auth/store/auth-store";
import { toastError, toastSuccess } from "@/lib/toast";

export function useAuth() {
  const token = useAuthStore((s) => s.token);
  const username = useAuthStore((s) => s.username);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setSession = useAuthStore((s) => s.setSession);
  const clearSession = useAuthStore((s) => s.clearSession);

  const login = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => loginWithEmail(email, password),
    onSuccess: (data) => {
      setSession(data.user.name, data.token);
      toastSuccess(`Welcome back, ${data.user.name}!`);
    },
    onError: (error) => toastError(error, "Login failed"),
  });

  const register = useMutation({
    mutationFn: ({ email, password, name }: { email: string; password: string; name: string }) =>
      registerWithEmail(email, password, name),
    onSuccess: (data) => {
      setSession(data.user.name, data.token);
      toastSuccess(`Account created. Welcome, ${data.user.name}!`);
    },
    onError: (error) => toastError(error, "Registration failed"),
  });

  const logout = useMutation({
    mutationFn: logoutSession,
    onSuccess: () => {
      clearSession();
      toastSuccess("Signed out successfully");
    },
    onError: (error) => toastError(error, "Sign out failed"),
  });

  return { token, username, isAuthenticated, login, register, logout };
}
