import { LOCALHOST, serviceUrl } from "ports";

const authUrl = serviceUrl("auth", { hostname: LOCALHOST });

// Server-only settings, read from the environment with local defaults
export const env = {
  databaseUrl: process.env.DATABASE_URL || "postgres://postgres:postgres@127.0.0.1:5433/link_shortener",
  authJwksUrl: process.env.AUTH_JWKS_URL || `${authUrl}/.well-known/jwks.json`,
  authIssuer: process.env.AUTH_ISSUER || authUrl,
  authAudience: process.env.AUTH_AUDIENCE || "chatwave",
};
