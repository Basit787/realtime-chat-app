import { appConfig, type AppConfig, type AuthUser } from "@app/common";
import { Inject, Injectable } from "@nestjs/common";
import { createRemoteJWKSet, jwtVerify } from "jose";
import type { IncomingHttpHeaders } from "node:http";

type AccessTokenClaims = { name?: string; role?: string };

// Verifies access tokens issued by the auth service (apps/auth) against its published keys
@Injectable()
export class AuthService {
  private readonly jwks: ReturnType<typeof createRemoteJWKSet>;

  constructor(@Inject(appConfig.KEY) private readonly config: AppConfig) {
    this.jwks = createRemoteJWKSet(new URL(config.auth.jwksUrl));
  }

  async getUserFromToken(token: string): Promise<AuthUser | null> {
    try {
      const { payload } = await jwtVerify<AccessTokenClaims>(token, this.jwks, {
        issuer: this.config.auth.issuer,
        audience: this.config.auth.audience,
      });
      if (!payload.sub || !payload.name) return null;
      return { id: payload.sub, role: payload.role === "admin" ? "admin" : "user", username: payload.name };
    } catch {
      return null;
    }
  }

  getSessionUser(headers: IncomingHttpHeaders): Promise<AuthUser | null> {
    const [scheme, token] = headers.authorization?.split(" ") ?? [];
    return scheme?.toLowerCase() === "bearer" && token ? this.getUserFromToken(token) : Promise.resolve(null);
  }
}
