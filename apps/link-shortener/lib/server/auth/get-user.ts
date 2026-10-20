import { jwtVerify } from "jose";
import { env } from "@/lib/server/env";
import type { AuthUser } from "@/lib/types/auth-user";
import { jwks } from "./jwks";

// The user behind the request's bearer access token (issued by apps/auth), or null
export async function getUser(request: Request): Promise<AuthUser | null> {
  const [scheme, token] = request.headers.get("authorization")?.split(" ") ?? [];
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  try {
    const { payload } = await jwtVerify<{ name?: string; role?: string }>(token, jwks, {
      issuer: env.authIssuer,
      audience: env.authAudience,
    });
    if (!payload.sub || !payload.name) return null;
    return { id: payload.sub, username: payload.name, role: payload.role === "admin" ? "admin" : "user" };
  } catch {
    return null;
  }
}
