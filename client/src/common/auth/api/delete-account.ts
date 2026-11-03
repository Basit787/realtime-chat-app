import { createApiClient } from "../../api/client";
import { createApiError } from "../../api/errors";
import type { AuthClient } from "../client";

// Deletes the signed-in account with its session cookie, then drops the local session
export const deleteAccount = async (client: AuthClient, password: string): Promise<void> => {
  const api = createApiClient({ baseURL: client.baseUrl, withCredentials: true });
  const response = await api.post<{ success: boolean }>("/auth/delete-user", { password });
  if (!response.ok) throw createApiError(response.message ?? "Could not delete account", response.status);
  await client.signOut();
};
