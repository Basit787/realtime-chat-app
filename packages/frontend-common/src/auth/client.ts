import type { AuthAccount, AuthSnapshot, AuthStorage, SignInPayload, SignUpPayload, TokenReply } from "./types";

const STORAGE_KEY = "chatwave-session";
const REFRESH_MARGIN_MS = 60_000;
const RETRY_MS = 30_000;
const MIN_PASSWORD_LENGTH = 8;

type StoredSession = { sessionToken: string; user: AuthAccount };

export class AuthError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export type AuthClientOptions = {
  // Auth service API base, e.g. "http://192.168.1.20:3005/api"
  baseUrl: string;
  // Native keeps the session token here (bearer); without it the auth service's cookie is the session (web)
  storage?: AuthStorage;
  headers?: Record<string, string>;
};

// Stored avatars point at the auth service's public URL; re-base them on the URL this app can reach
export const resolveAuthAvatar = (baseUrl: string, image?: string | null): string | undefined => {
  const match = image?.match(/\/api(\/avatars\/.+)$/);
  return match ? `${baseUrl.replace(/\/$/, "")}${match[1]}` : undefined;
};

export const createAuthClient = ({ baseUrl, storage, headers: extraHeaders }: AuthClientOptions) => {
  const base = baseUrl.replace(/\/$/, "");
  const listeners = new Set<() => void>();
  let snapshot: AuthSnapshot = { status: "loading", user: null, accessToken: "" };
  let sessionToken = "";
  let expiresAt = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let refreshing: Promise<string> | null = null;
  let restoring: Promise<void> | null = null;

  const emit = (next: AuthSnapshot) => {
    snapshot = next;
    listeners.forEach((listener) => listener());
  };

  const request = async <T>(path: string, init: { method?: string; body?: unknown } = {}) => {
    const headers: Record<string, string> = { Accept: "application/json", ...extraHeaders };
    if (sessionToken) headers.Authorization = `Bearer ${sessionToken}`;
    let body: FormData | string | undefined;
    if (init.body instanceof FormData) body = init.body;
    else if (init.body !== undefined) {
      body = JSON.stringify(init.body);
      headers["Content-Type"] = "application/json";
    }
    let response: Response;
    try {
      response = await fetch(`${base}${path}`, {
        method: init.method ?? (body === undefined ? "GET" : "POST"),
        headers,
        body,
        credentials: storage ? "omit" : "include",
      });
    } catch {
      throw new AuthError("Cannot reach the sign-in service", 0);
    }
    const text = await response.text();
    let data: unknown = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }
    if (!response.ok) {
      const error = data as { message?: string; error?: string } | null;
      throw new AuthError(error?.message || error?.error || `Request failed (${response.status})`, response.status);
    }
    return { data: data as T, headers: response.headers };
  };

  const persist = async (user: AuthAccount | null) => {
    if (!storage) return;
    if (user && sessionToken) {
      await storage.setItem(STORAGE_KEY, JSON.stringify({ sessionToken, user } satisfies StoredSession));
    } else {
      await storage.removeItem(STORAGE_KEY);
    }
  };

  const clear = async () => {
    clearTimeout(timer);
    sessionToken = "";
    expiresAt = 0;
    emit({ status: "signedOut", user: null, accessToken: "" });
    await persist(null);
  };

  const retry = () => {
    clearTimeout(timer);
    timer = setTimeout(() => void refresh().catch(retry), RETRY_MS);
  };

  // Renews the access token shortly before it expires
  const schedule = () => {
    clearTimeout(timer);
    timer = setTimeout(() => void refresh().catch(retry), Math.max(expiresAt - Date.now() - REFRESH_MARGIN_MS, 5_000));
  };

  // Exchanges the session for an access token; a rejected session signs out
  const exchange = async (): Promise<string> => {
    try {
      const { data } = await request<TokenReply>("/token", { method: "POST" });
      expiresAt = data.expiresAt;
      emit({ status: "signedIn", user: data.user, accessToken: data.accessToken });
      schedule();
      await persist(data.user);
      return data.accessToken;
    } catch (error) {
      if (error instanceof AuthError && error.status === 401) {
        await clear();
        return "";
      }
      throw error;
    }
  };

  const refresh = (): Promise<string> => {
    refreshing ??= exchange().finally(() => {
      refreshing = null;
    });
    return refreshing;
  };

  const readStored = async (): Promise<StoredSession | null> => {
    try {
      const raw = await storage?.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as StoredSession) : null;
    } catch {
      return null;
    }
  };

  // Called once at startup: resumes the stored session (native) or the auth cookie (web)
  const restore = (): Promise<void> => {
    restoring ??= (async () => {
      if (storage) {
        const stored = await readStored();
        if (!stored?.sessionToken) return clear();
        sessionToken = stored.sessionToken;
        // Opens offline with the last known account until the service answers
        emit({ status: "signedIn", user: stored.user, accessToken: "" });
      }
      try {
        await refresh();
      } catch {
        if (storage) retry();
        else emit({ status: "signedOut", user: null, accessToken: "" });
      }
    })();
    return restoring;
  };

  const sessionTokenFrom = (data: { token?: string | null } | null, headers: Headers) => {
    const header = headers.get("set-auth-token");
    return header ? decodeURIComponent(header) : (data?.token ?? "");
  };

  const authenticate = async (path: string, body: SignInPayload | SignUpPayload) => {
    const { data, headers } = await request<{ token?: string }>(path, { body });
    if (storage) {
      sessionToken = sessionTokenFrom(data, headers);
      if (!sessionToken) throw new AuthError("Sign-in response did not include a session", 500);
    }
    if (!(await refresh())) throw new AuthError("Could not start a session", 401);
  };

  const signIn = (payload: SignInPayload) => authenticate("/auth/sign-in/email", payload);

  const signUp = (payload: SignUpPayload) => {
    if (payload.password.length < MIN_PASSWORD_LENGTH) {
      return Promise.reject(new AuthError(`Use at least ${MIN_PASSWORD_LENGTH} characters`, 400));
    }
    return authenticate("/auth/sign-up/email", payload);
  };

  const signOut = async () => {
    await request("/auth/sign-out", { body: {} }).catch(() => undefined);
    await clear();
  };

  // Account changes go to the auth service, then a new access token carries them
  const updateName = async (name: string) => {
    await request("/auth/update-user", { body: { name } });
    await refresh();
  };

  const changeEmail = async (newEmail: string) => {
    await request("/auth/change-email", { body: { newEmail } });
    await refresh();
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    const { data, headers } = await request<{ token?: string | null }>("/auth/change-password", {
      body: { currentPassword, newPassword, revokeOtherSessions: true },
    });
    // Revoking the other sessions replaces this one as well
    if (storage) sessionToken = sessionTokenFrom(data, headers) || sessionToken;
    await refresh();
  };

  const deleteAccount = async (password: string) => {
    await request("/auth/delete-user", { body: { password } });
    await clear();
  };

  // `form` holds the image as "photo"
  const uploadAvatar = async (form: FormData) => {
    await request("/account/avatar", { body: form });
    await refresh();
  };

  const removeAvatar = async () => {
    await request("/account/avatar", { method: "DELETE" });
    await refresh();
  };

  // A valid access token, renewed first when it is about to expire
  const getAccessToken = async (): Promise<string> => {
    if (snapshot.status === "signedOut") return "";
    if (snapshot.accessToken && expiresAt - REFRESH_MARGIN_MS > Date.now()) return snapshot.accessToken;
    return refresh().catch(() => snapshot.accessToken);
  };

  return {
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    avatarUrl: (image?: string | null) => resolveAuthAvatar(base, image),
    restore,
    refresh: () => refresh().catch(() => snapshot.accessToken),
    getAccessToken,
    signIn,
    signUp,
    signOut,
    updateName,
    changeEmail,
    changePassword,
    deleteAccount,
    uploadAvatar,
    removeAvatar,
  };
};

export type AuthClient = ReturnType<typeof createAuthClient>;
