import { localAppOrigins, LOCALHOST, PORTS, serviceUrl } from "ports";
import { registerAs, type ConfigType } from "@nestjs/config";

const list = (value: string | undefined, fallback: string[]) =>
  value
    ?.split(",")
    .map((v) => v.trim())
    .filter(Boolean) ?? fallback;

const allowLanOrigins = process.env.ALLOW_LAN_ORIGINS
  ? process.env.ALLOW_LAN_ORIGINS === "true"
  : process.env.NODE_ENV !== "production";

// Read once at startup; inject with @Inject(appConfig.KEY) for a typed AppConfig
export const appConfig = registerAs("app", () => ({
  port: Number(process.env.PORT) || PORTS.auth,
  mongodbUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27018/realtime_chat",
  betterAuthSecret: process.env.BETTER_AUTH_SECRET || "dev-secret-change-me",
  // Public base URL of this service; also the JWT issuer
  publicUrl: (process.env.AUTH_PUBLIC_URL || serviceUrl("auth", { hostname: LOCALHOST })).replace(/\/$/, ""),
  audience: process.env.AUTH_AUDIENCE || "chatwave",
  accessTokenTtl: process.env.ACCESS_TOKEN_TTL || "15m",
  // httpOnly cookie that renews access tokens; rotated on every use, stored hashed in `refreshtokens`
  refreshToken: {
    ttlDays: Number(process.env.REFRESH_TOKEN_TTL_DAYS) || 7,
    cookieName: process.env.REFRESH_COOKIE_NAME || "chatwave_refresh",
    // Web apps reach this service through their /auth-api proxy, so the cookie goes nowhere else
    cookiePath: process.env.REFRESH_COOKIE_PATH || "/auth-api",
    cookieSecure: process.env.COOKIE_SECURE === "true",
  },
  corsOrigin: list(process.env.CORS_ORIGIN, localAppOrigins()),
  allowLanOrigins,
  mobileAppOrigin: process.env.MOBILE_APP_ORIGIN || "chatwave://",
  minio: {
    endpoint: process.env.MINIO_ENDPOINT?.trim() ?? "",
    accessKey: process.env.MINIO_ACCESS_KEY || process.env.MINIO_ROOT_USER || "minioadmin",
    secretKey: process.env.MINIO_SECRET_KEY || process.env.MINIO_ROOT_PASSWORD || "minioadmin",
    bucket: process.env.MINIO_BUCKET || "chat-uploads",
    region: process.env.MINIO_REGION || "us-east-1",
  },
  admin: {
    email: process.env.ADMIN_EMAIL || "admin@chat.local",
    password: process.env.ADMIN_PASSWORD || "Admin123!",
    name: process.env.ADMIN_NAME || "admin",
  },
}));

export type AppConfig = ConfigType<typeof appConfig>;
