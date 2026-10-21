import { createApiClient } from "frontend-common";
import { authClient } from "@/lib/auth";

export const apiClient = createApiClient({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  getAccessToken: authClient.getAccessToken,
  // An expired token gets renewed; a revoked session signs the user out
  onUnauthorized: () => void authClient.refresh(),
});
