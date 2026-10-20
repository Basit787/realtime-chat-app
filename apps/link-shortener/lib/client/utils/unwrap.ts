import { createApiError, type ApiResponse } from "frontend-common";

// The data of a successful API result; a failed one throws its server message
export function unwrap<T>(response: ApiResponse<T>, fallback: string): T {
  if (!response.ok) throw createApiError(response.message ?? fallback, response.status);
  return response.data;
}
