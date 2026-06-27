import { AuthPage, ChatPage } from "@/pages";
import { useAuthStore } from "@/pages/auth/store/auth-store";

export default function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return isAuthenticated ? <ChatPage /> : <AuthPage />;
}
