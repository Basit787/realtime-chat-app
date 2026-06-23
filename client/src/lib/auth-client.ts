import { createAuthClient } from "better-auth/client";

const AUTH_TOKEN_KEY = "auth_token";
const AUTH_NAME_KEY = "auth_name";

export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY) || "";
}

export function getAuthName() {
  return localStorage.getItem(AUTH_NAME_KEY) || "";
}

export function setAuthToken(token: string) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function setAuthName(name: string) {
  localStorage.setItem(AUTH_NAME_KEY, name);
}

export function clearAuth() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_NAME_KEY);
}

export const authClient = createAuthClient({
  baseURL: "/api",
  fetchOptions: {
    auth: {
      type: "Bearer",
      token: () => getAuthToken(),
    },
    onSuccess: (ctx) => {
      const token = ctx.response.headers.get("set-auth-token");
      if (token) setAuthToken(decodeURIComponent(token));
    },
  },
});
