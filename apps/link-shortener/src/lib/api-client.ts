import { createApiClient } from "frontend-common";
import { authClient } from "./auth-client";

export const apiClient = createApiClient({
  baseURL: "/api",
  getAccessToken: authClient.getAccessToken,
  // An expired token gets renewed; a revoked session signs the user out
  onUnauthorized: () => void authClient.refresh(),
});
