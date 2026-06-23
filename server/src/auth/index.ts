import type { Connection } from "mongoose";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { admin } from "better-auth/plugins";
import { bearer } from "better-auth/plugins";
import { config } from "../config/index.js";

export type AppAuth = ReturnType<typeof createAuth>;

export function createAuth(connection: Connection) {
  const client = connection.getClient();

  return betterAuth({
    secret: config.betterAuthSecret,
    baseURL: config.betterAuthUrl,
    basePath: "/auth",
    trustedOrigins: config.corsOrigin,
    database: mongodbAdapter(client.db()),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
    },
    plugins: [
      bearer(),
      admin({
        defaultRole: "user",
        adminRoles: ["admin"],
      }),
    ],
  });
}
