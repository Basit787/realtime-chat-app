import { Inject, Injectable } from "@nestjs/common";
import { fromNodeHeaders } from "better-auth/node";
import type { IncomingHttpHeaders } from "node:http";
import { AUTH, type AppAuth } from "./auth.factory.js";
import type { AuthUserDto } from "./dto/auth-user.dto.js";

type SessionUser = { id: string; name: string; email: string; image?: string | null; role?: string | null };

export type AuthSession = { user: AuthUserDto; sessionId: string; sessionToken: string };

export const toAuthUser = (user: SessionUser): AuthUserDto => ({
  id: user.id,
  name: user.name,
  email: user.email,
  image: user.image ?? "",
  role: user.role === "admin" ? "admin" : "user",
});

@Injectable()
export class AuthService {
  constructor(@Inject(AUTH) readonly auth: AppAuth) {}

  // The signed-in user from a bearer session token (apps) or the session cookie
  async getSession(headers: IncomingHttpHeaders): Promise<AuthSession | null> {
    const session = await this.auth.api.getSession({ headers: fromNodeHeaders(headers) });
    if (!session?.user) return null;
    return {
      user: toAuthUser(session.user as SessionUser),
      sessionId: session.session.id,
      sessionToken: session.session.token,
    };
  }

  // Ends the better-auth session; returns the Set-Cookie headers that clear its cookie
  async signOut(headers: IncomingHttpHeaders): Promise<string[]> {
    try {
      const response = await this.auth.api.signOut({ headers: fromNodeHeaders(headers), asResponse: true });
      return response.headers.getSetCookie();
    } catch {
      return [];
    }
  }

  async updateImage(headers: IncomingHttpHeaders, image: string) {
    await this.auth.api.updateUser({ body: { image }, headers: fromNodeHeaders(headers) });
  }
}
