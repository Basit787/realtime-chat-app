import { jwtVerify } from "jose";
import { env } from "../../config/env.js";
import type { AuthUser } from "../../types/auth-user.js";
import { jwks } from "./jwks.js";

// The user behind a bearer access token (issued by apps/auth), or null
export const getUser = async (authorization: string | undefined): Promise<AuthUser | null> => {
  const [scheme, token] = authorization?.split(" ") ?? [];
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  try {
    const { payload } = await jwtVerify<{ name?: string; role?: string }>(token, jwks, {
      issuer: env.auth.issuer,
      audience: env.auth.audience,
    });
    if (!payload.sub || !payload.name) return null;
    return { id: payload.sub, username: payload.name, role: payload.role === "admin" ? "admin" : "user" };
  } catch {
    return null;
  }
};
