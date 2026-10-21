import type { ApiError } from "./api-error";

// JSON error body every client reads: `{ error, details? }`
export const errorResponse = (status: number, error: string, details?: ApiError["details"]) =>
  Response.json(details ? { error, details } : { error }, { status });
