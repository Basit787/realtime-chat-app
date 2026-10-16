import type { Connection } from "mongoose";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { admin } from "better-auth/plugins";
import { bearer } from "better-auth/plugins";
import { config } from "../../config/index.js";
import { isAllowedOrigin } from "../../config/origins.js";

export type AppAuth = ReturnType<typeof createAuth>;

export const createAuth = (connection: Connection) => {
  const client = connection.getClient();

  return betterAuth({
    secret: config.betterAuthSecret,
    baseURL: config.betterAuthUrl,
    basePath: "/auth",
    // Trust the caller's origin when it is allowed (e.g. a phone hitting http://<lan-ip>:5176)
    trustedOrigins: (request) => {
      const origin = request?.headers.get("origin");
      return origin && isAllowedOrigin(origin) ? [...config.corsOrigin, origin] : config.corsOrigin;
    },
    database: mongodbAdapter(client.db()),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
    },
    user: {
      changeEmail: {
        enabled: true,
        updateEmailWithoutVerification: true,
      },
      deleteUser: {
        enabled: true,
      },
    },
    plugins: [
      bearer(),
      admin({
        defaultRole: "user",
        adminRoles: ["admin"],
      }),
    ],
  });
};
