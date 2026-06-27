import type { AxiosError } from "axios";
import type { ApiError, ApiErrorBody } from "@/lib/api-types";

export const API_MESSAGES = {
  timeout: "The request timed out. Please try again.",
  network: "Network error. Check your connection and try again.",
  unauthorized: "Your session has expired. Please sign in again.",
  forbidden: "You do not have permission to perform this action.",
  server: "Something went wrong on the server. Please try again later.",
  unexpected: "An unexpected error occurred.",
} as const;

const AUTH_ROUTE_PREFIX = "/auth/";

export const isAuthRoute = (url?: string) => {
  return !!url?.includes(AUTH_ROUTE_PREFIX);
};

export const isSessionValidationRoute = (url?: string) => {
  return !!url?.includes("/auth/get-session");
};

export const isAuthAttemptRoute = (url?: string) => {
  if (!url) return false;
  return url.includes("/auth/sign-in") || url.includes("/auth/sign-up");
};

export const shouldClearSessionOnUnauthorized = (url?: string) => {
  if (isSessionValidationRoute(url)) return true;
  if (isAuthAttemptRoute(url)) return false;
  return isAuthRoute(url) || !!url;
};

export const getResponseMessage = (error: AxiosError<ApiErrorBody>) => {
  const data = error.response?.data;
  if (typeof data?.message === "string" && data.message.trim()) return data.message;
  if (typeof data?.error === "string" && data.error.trim()) return data.error;
  return error.message || API_MESSAGES.unexpected;
};

export const resolveNetworkError = (error: AxiosError): ApiError => {
  if (error.message === "Network Error") {
    return { status: 0, message: API_MESSAGES.network };
  }
  return { status: 0, message: error.message || API_MESSAGES.network };
};

export const resolveUnauthorizedMessage = (url: string | undefined, serverMessage: string) => {
  if (isAuthAttemptRoute(url)) return serverMessage;
  return serverMessage || API_MESSAGES.unauthorized;
};

export const resolveLoginRejectMessage = (serverMessage: string) => {
  return serverMessage || "Invalid email or password";
};

export const isApiError = (error: unknown): error is ApiError => {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    "message" in error &&
    typeof (error as ApiError).message === "string"
  );
};

export const createApiError = (message: string, status = 0): Error & { status: number } => {
  const err = new Error(message) as Error & { status: number };
  err.status = status;
  return err;
};

export const resolveMutationError = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message.trim()) return error.message;
  if (isApiError(error)) return error.message;
  return fallback;
};

export const resolveAuthMutationError = (error: unknown, fallback: string): string => {
  return resolveMutationError(error, fallback);
};
