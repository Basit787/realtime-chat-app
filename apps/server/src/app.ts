import cors from "cors";
import express from "express";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import { toNodeHandler } from "better-auth/node";
import type { AppAuth } from "./modules/auth/auth.js";
import { corsOriginCallback } from "./config/origins.js";
import { errorHandler } from "@chat/backend-common";

export const createApp = (auth: AppAuth) => {
  const app = express();

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "blob:", "https://validator.swagger.io"],
        },
      },
    }),
  );
  app.use(cors({ origin: corsOriginCallback, credentials: true }));
  app.all("/auth/*", toNodeHandler(auth));
  app.use(express.json({ limit: "64kb" }));
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

  return app;
};

export const registerErrorHandler = (app: express.Application) => {
  app.use(errorHandler);
};
