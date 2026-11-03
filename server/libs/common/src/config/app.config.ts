import { registerAs, type ConfigType } from "@nestjs/config";

const DEFAULT_PORT = 3001;

const list = (value: string | undefined, fallback: string[]) =>
  value
    ?.split(",")
    .map((v) => v.trim())
    .filter(Boolean) ?? fallback;

// Read once at startup; inject with @Inject(appConfig.KEY) for a typed AppConfig
export const appConfig = registerAs("app", () => ({
  port: Number(process.env.PORT) || DEFAULT_PORT,
  mongodbUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27018/realtime_chat",
  betterAuthSecret: process.env.BETTER_AUTH_SECRET || "dev-secret-change-me",
  // Public base URL of this server; the access-token issuer and the base of avatar links
  publicUrl: (process.env.PUBLIC_URL || `http://localhost:${DEFAULT_PORT}`).replace(/\/$/, ""),
  audience: process.env.AUTH_AUDIENCE || "chatwave",
  accessTokenTtl: process.env.ACCESS_TOKEN_TTL || "15m",
  // httpOnly cookie that renews access tokens; rotated on every use, stored hashed in `refreshtokens`
  refreshToken: {
    ttlDays: Number(process.env.REFRESH_TOKEN_TTL_DAYS) || 7,
    cookieName: process.env.REFRESH_COOKIE_NAME || "chatwave_refresh",
    // The client reaches this server through its /api proxy, so the cookie goes nowhere else
    cookiePath: process.env.REFRESH_COOKIE_PATH || "/api",
    cookieSecure: process.env.COOKIE_SECURE === "true",
  },
  corsOrigin: list(process.env.CORS_ORIGIN, ["http://localhost:3000", "https://localhost:3000", "http://localhost:80"]),
  allowLanOrigins: process.env.ALLOW_LAN_ORIGINS
    ? process.env.ALLOW_LAN_ORIGINS === "true"
    : process.env.NODE_ENV !== "production",
  maxFileSizeMb: Number(process.env.MAX_FILE_SIZE_MB) || 25,
  minio: {
    endpoint: process.env.MINIO_ENDPOINT?.trim() ?? "",
    accessKey: process.env.MINIO_ACCESS_KEY || process.env.MINIO_ROOT_USER || "minioadmin",
    secretKey: process.env.MINIO_SECRET_KEY || process.env.MINIO_ROOT_PASSWORD || "minioadmin",
    bucket: process.env.MINIO_BUCKET || "chat-uploads",
    region: process.env.MINIO_REGION || "us-east-1",
  },
  turn: {
    host: process.env.TURN_HOST || "localhost",
    port: Number(process.env.TURN_PORT) || 3478,
    user: process.env.TURN_USER || "chat",
    password: process.env.TURN_PASSWORD || "chatpass",
  },
}));

export type AppConfig = ConfigType<typeof appConfig>;
