import type { AxiosResponse } from "axios";
import { api } from "@/lib/axios";

type AuthUser = {
  id: string;
  name: string;
  email: string;
};

type AuthResponse = {
  user: AuthUser;
  token: string;
};

function extractAuthToken(headers: AxiosResponse["headers"]) {
  const token = headers["set-auth-token"];
  return token ? decodeURIComponent(String(token)) : "";
}

function toAuthResponse(response: AxiosResponse<{ user: AuthUser }>): AuthResponse {
  return {
    user: response.data.user,
    token: extractAuthToken(response.headers),
  };
}

export async function loginWithEmail(email: string, password: string) {
  const response = await api.post<{ user: AuthUser }>("/auth/sign-in/email", { email, password });
  return toAuthResponse(response);
}

export async function registerWithEmail(email: string, password: string, name: string) {
  const response = await api.post<{ user: AuthUser }>("/auth/sign-up/email", { email, password, name });
  return toAuthResponse(response);
}

export async function logoutSession() {
  await api.post("/auth/sign-out");
}
