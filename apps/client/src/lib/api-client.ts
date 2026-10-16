import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";
import type {
  ApiError,
  ApiErrorBody,
  ApiResponse,
  ApiResponseWithMeta,
} from "@/lib/api-types";
import {
  API_MESSAGES,
  getResponseMessage,
  isAuthAttemptRoute,
  isSessionValidationRoute,
  resolveLoginRejectMessage,
  resolveNetworkError,
  resolveUnauthorizedMessage,
  shouldClearSessionOnUnauthorized,
} from "@/lib/api-errors";
import { useAuthStore } from "@/pages/auth/store/auth-store";

const clearAuthStorage = () => {
  useAuthStore.getState().clearSession();
};

const createApiClient = () => {
  const client: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? "/api",
    timeout: 30_000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  const setupInterceptors = () => {
    client.interceptors.request.use(
      (config) => {
        config.headers["X-Request-Time"] = Date.now().toString();
        const token = useAuthStore.getState().token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        if (config.data instanceof FormData) {
          delete config.headers["Content-Type"];
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiErrorBody>) => {
        if (error.code === "ECONNABORTED") {
          return Promise.reject({
            status: 408,
            message: API_MESSAGES.timeout,
          } satisfies ApiError);
        }

        if (!error.response) {
          return Promise.reject(resolveNetworkError(error));
        }

        const status = error.response.status;
        const serverMessage = getResponseMessage(error);
        const requestUrl = error.config?.url;

        if (status === 401) {
          const isSessionCheck = isSessionValidationRoute(requestUrl);
          const isAuthAttempt = isAuthAttemptRoute(requestUrl);

          if (isSessionCheck) {
            clearAuthStorage();
            return Promise.reject({
              status,
              message: serverMessage,
            } satisfies ApiError);
          }

          if (shouldClearSessionOnUnauthorized(requestUrl) && !isAuthAttempt) {
            clearAuthStorage();
          }

          return Promise.reject({
            status,
            message: isAuthAttempt
              ? resolveLoginRejectMessage(serverMessage)
              : resolveUnauthorizedMessage(requestUrl, serverMessage),
          } satisfies ApiError);
        }

        if (status === 403) {
          return Promise.reject({
            status,
            message: serverMessage || API_MESSAGES.forbidden,
          } satisfies ApiError);
        }

        if (status >= 500) {
          return Promise.reject({
            status,
            message: serverMessage || API_MESSAGES.server,
          } satisfies ApiError);
        }

        return Promise.reject({
          status,
          message: serverMessage,
        } satisfies ApiError);
      },
    );
  };

  setupInterceptors();

  const request = async <T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    try {
      const response = await client.request<T>(config);
      return {
        ok: true,
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      const err = error as ApiError;
      return {
        ok: false,
        status: err.status ?? 0,
        message: err.message ?? API_MESSAGES.unexpected,
      };
    }
  };

  const requestRaw = <T = unknown>(config: AxiosRequestConfig) => client.request<T>(config);

  const postForAuth = async <TUser>(
    url: string,
    body: unknown,
    signal?: AbortSignal,
  ): Promise<ApiResponse<{ user: TUser; token: string }>> => {
    try {
      const response = await client.post<{ user: TUser }>(url, body, { signal });
      const token = extractAuthToken(response.headers);
      if (!token) {
        return {
          ok: false,
          status: response.status,
          message: "Auth response did not include a token",
        };
      }
      return {
        ok: true,
        data: { user: response.data.user, token },
        status: response.status,
      };
    } catch (error) {
      const err = error as ApiError;
      return {
        ok: false,
        status: err.status ?? 0,
        message: err.message ?? API_MESSAGES.unexpected,
      };
    }
  };

  const get = <T>(url: string, params?: Record<string, unknown>, signal?: AbortSignal) =>
    request<T>({ method: "GET", url, params, signal });

  const post = <T, D = unknown>(url: string, body?: D, signal?: AbortSignal) =>
    request<T>({ method: "POST", url, data: body, signal });

  const patch = <T, D = unknown>(url: string, body?: D, signal?: AbortSignal) =>
    request<T>({ method: "PATCH", url, data: body, signal });

  const put = <T, D = unknown>(url: string, body?: D, signal?: AbortSignal) =>
    request<T>({ method: "PUT", url, data: body, signal });

  const del = <T>(url: string, params?: Record<string, unknown>, signal?: AbortSignal) =>
    request<T>({ method: "DELETE", url, params, signal });

  const postForm = <T>(url: string, formData: FormData, signal?: AbortSignal) =>
    request<T>({
      method: "POST",
      url,
      data: formData,
      timeout: 60_000,
      signal,
    });

  const getBlob = async (
    url: string,
    params?: Record<string, unknown>,
    signal?: AbortSignal,
  ): Promise<ApiResponse<Blob>> => {
    try {
      const response = await client.get<Blob>(url, {
        params,
        signal,
        responseType: "blob",
      });
      return {
        ok: true,
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      const err = error as ApiError;
      return {
        ok: false,
        status: err.status ?? 0,
        message: err.message ?? API_MESSAGES.unexpected,
      };
    }
  };

  const getWithMeta = async <T>(
    url: string,
    params?: Record<string, unknown>,
    signal?: AbortSignal,
  ): Promise<ApiResponseWithMeta<T>> => {
    try {
      const response = await client.get<{ data: T; meta?: Record<string, unknown> } | T>(url, {
        params,
        signal,
      });
      const body = response.data;
      if (body && typeof body === "object" && "data" in body) {
        return {
          ok: true,
          data: body.data,
          meta: body.meta,
          status: response.status,
        };
      }
      return {
        ok: true,
        data: body as T,
        status: response.status,
      };
    } catch (error) {
      const err = error as ApiError;
      return {
        ok: false,
        status: err.status ?? 0,
        message: err.message ?? API_MESSAGES.unexpected,
      };
    }
  };

  return {
    client,
    requestRaw,
    postForAuth,
    get,
    post,
    patch,
    put,
    delete: del,
    postForm,
    getBlob,
    getWithMeta,
  };
};

export const apiClient = createApiClient();

export const extractAuthToken = (headers: AxiosResponse["headers"]) => {
  const token = headers["set-auth-token"];
  return token ? decodeURIComponent(String(token)) : "";
};
