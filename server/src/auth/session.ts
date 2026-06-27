import type { IncomingHttpHeaders } from "node:http";
import { fromNodeHeaders } from "better-auth/node";
import type { AppAuth } from "../auth/index.js";
import type { AuthUser } from "../types/index.js";
import type { Role } from "../types/role.js";

export const mapSessionUser = (user: { id: string; name: string; role?: string | null }): AuthUser => {
  const role: Role = user.role === "admin" ? "admin" : "user";
  return { id: user.id, role, username: user.name };
};

export const getSessionUser = async (
  auth: AppAuth,
  headers: IncomingHttpHeaders,
): Promise<AuthUser | null> => {
  const session = await auth.api.getSession({ headers: fromNodeHeaders(headers) });
  if (!session?.user) return null;
  return mapSessionUser(session.user as { id: string; name: string; role?: string | null });
};

export const getBearerHeaders = (token: string): IncomingHttpHeaders => ({
  authorization: `Bearer ${token}`,
});
