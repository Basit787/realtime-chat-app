import { isAllowedOrigin, type AppConfig } from "@app/common";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, bearer } from "better-auth/plugins";
import type { PrismaClient } from "@prisma/client";

export const createAuth = (prisma: PrismaClient, config: AppConfig) =>
  betterAuth({
    secret: config.betterAuthSecret,
    baseURL: config.publicUrl,
    basePath: "/api/auth",
    // Trust the caller's origin when it is allowed (the client, LAN devices)
    trustedOrigins: (request) => {
      const origin = request?.headers.get("origin");
      return origin && isAllowedOrigin(config, origin) ? [...config.corsOrigin, origin] : config.corsOrigin;
    },
    database: prismaAdapter(prisma, { provider: "mongodb" }),
    // MongoDB generates the ObjectId of every user, session and account
    advanced: { database: { generateId: false } },
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
