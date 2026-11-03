import { appConfig, type AppConfig } from "@app/common";
import { RefreshTokenRepository } from "@app/db";
import { Inject, Injectable } from "@nestjs/common";
import { createHash, randomBytes } from "node:crypto";
import type { IncomingHttpHeaders } from "node:http";
import type { RefreshToken } from "@app/db";
import type { AuthSession } from "../auth/auth.service.js";

const DAY_MS = 24 * 60 * 60 * 1000;
// A token replaced this recently is still accepted, for parallel refreshes from several tabs or apps
const REPLACED_GRACE_MS = 30_000;

export type RefreshResult =
  // Send `token` as the new cookie
  | { status: "rotated"; token: string }
  // Keep the cookie the browser already has
  | { status: "unchanged" }
  // Missing, expired or reused: the session must end
  | { status: "rejected" };

const hashToken = (token: string) => createHash("sha256").update(token).digest("base64url");
const newToken = () => randomBytes(32).toString("base64url");

// Rotating refresh tokens bound to better-auth sessions, kept in an httpOnly cookie and stored only as hashes
@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly tokens: RefreshTokenRepository,
    @Inject(appConfig.KEY) private readonly config: AppConfig,
  ) {}

  // Checks the caller's token and replaces it; a session's first refresh (right after sign-in) starts its chain
  async refresh(session: AuthSession, headers: IncomingHttpHeaders): Promise<RefreshResult> {
    // Bearer-only callers (native apps) send no cookies and keep the session token themselves
    if (!headers.cookie) return { status: "unchanged" };

    const record = await this.tokens.findBySession(session.sessionId);
    if (!record) {
      const token = newToken();
      await this.tokens.create({
        sessionId: session.sessionId,
        userId: session.user.id,
        tokenHash: hashToken(token),
        expiresAt: this.expiresAt(),
      });
      return { status: "rotated", token };
    }

    const presented = this.read(headers);
    const presentedHash = presented ? hashToken(presented) : "";
    if (presentedHash === record.tokenHash && record.expiresAt > new Date()) {
      const token = newToken();
      if (await this.tokens.rotate(session.sessionId, presentedHash, hashToken(token), this.expiresAt())) {
        return { status: "rotated", token };
      }
      // A parallel request rotated it first
      const latest = await this.tokens.findBySession(session.sessionId);
      return this.recentlyReplaced(latest, presentedHash) ? { status: "unchanged" } : { status: "rejected" };
    }
    if (this.recentlyReplaced(record, presentedHash)) return { status: "unchanged" };

    // Missing or an old token presented again: it may have been copied, so the session's chain ends
    await this.tokens.deleteBySession(session.sessionId);
    return { status: "rejected" };
  }

  // Deletes the caller's refresh token (by session and by cookie)
  async revoke(headers: IncomingHttpHeaders, sessionId?: string) {
    const presented = this.read(headers);
    await Promise.all([
      sessionId ? this.tokens.deleteBySession(sessionId) : undefined,
      presented ? this.tokens.deleteByHash(hashToken(presented)) : undefined,
    ]);
  }

  cookie(token: string) {
    return this.serialize(token, this.config.refreshToken.ttlDays * DAY_MS);
  }

  clearedCookie() {
    return this.serialize("", 0);
  }

  private recentlyReplaced(record: RefreshToken | null, presentedHash: string) {
    return (
      !!record?.rotatedAt &&
      !!presentedHash &&
      record.previousHash === presentedHash &&
      Date.now() - record.rotatedAt.getTime() < REPLACED_GRACE_MS
    );
  }

  private expiresAt() {
    return new Date(Date.now() + this.config.refreshToken.ttlDays * DAY_MS);
  }

  private read(headers: IncomingHttpHeaders): string | undefined {
    const prefix = `${this.config.refreshToken.cookieName}=`;
    const pair = headers.cookie
      ?.split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith(prefix));
    return pair?.slice(prefix.length) || undefined;
  }

  private serialize(value: string, maxAgeMs: number) {
    const { cookieName, cookiePath, cookieSecure } = this.config.refreshToken;
    return [
      `${cookieName}=${value}`,
      `Path=${cookiePath}`,
      `Max-Age=${Math.floor(maxAgeMs / 1000)}`,
      "HttpOnly",
      "SameSite=Strict",
      ...(cookieSecure ? ["Secure"] : []),
    ].join("; ");
  }
}
