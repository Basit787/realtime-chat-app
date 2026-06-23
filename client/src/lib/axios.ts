import axios from "axios";
import { getAuthToken } from "@/lib/auth-client";

export const api = axios.create({
  baseURL: "/api",
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
