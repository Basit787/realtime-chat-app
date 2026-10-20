import { isAllowedOrigin, type AppConfig } from "@app/common";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { admin, bearer } from "better-auth/plugins";
import type { Connection } from "mongoose";

export const createAuth = (connection: Connection, config: AppConfig) =>
  betterAuth({
    secret: config.betterAuthSecret,
    baseURL: config.publicUrl,
    basePath: "/api/auth",
    // Trust the caller's origin when it is allowed (web apps, LAN devices, the mobile app)
    trustedOrigins: (request) => {
      const origin = request?.headers.get("origin");
      return origin && isAllowedOrigin(config, origin) ? [...config.corsOrigin, origin] : config.corsOrigin;
    },
    database: mongodbAdapter(connection.getClient().db()),
    emailAndPassword: { enabled: true, minPasswordLength: 8 },
    user: {
      changeEmail: { enabled: true, updateEmailWithoutVerification: true },
      deleteUser: { enabled: true },
    },
    // Apps keep the session token as their refresh token and send it as a bearer token
    plugins: [bearer(), admin({ defaultRole: "user", adminRoles: ["admin"] })],
  });

export type AppAuth = ReturnType<typeof createAuth>;

// Injection token for the better-auth instance
export const AUTH = Symbol("AUTH");
