import { type AuthUser } from "@app/common";
import { Injectable } from "@nestjs/common";
import type { IncomingHttpHeaders } from "node:http";
import { KeysService } from "./keys.service.js";

type AccessTokenClaims = { name?: string; role?: string };

// Verifies the access tokens this server issues (POST /api/token) against its own signing keys
@Injectable()
export class AccessTokenService {
  constructor(private readonly keys: KeysService) {}

  async getUserFromToken(token: string): Promise<AuthUser | null> {
    try {
      const payload = await this.keys.verify<AccessTokenClaims>(token);
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
