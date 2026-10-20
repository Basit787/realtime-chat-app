import { profileEndpoints, type PresenceStatus } from "frontend-common";
import { apiClient } from "@/lib/api-client";
import { createApiError } from "frontend-common";

export type { PresenceStatus };

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
