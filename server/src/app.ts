import cors from "cors";
import express from "express";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import { toNodeHandler } from "better-auth/node";
import type { AppAuth } from "./auth/index.js";
import { config } from "./config/index.js";
import { errorHandler } from "./middleware/index.js";

export function createApp(auth: AppAuth) {
  const app = express();

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https://validator.swagger.io"],
        },
      },
    }),
  );
  app.use(cors({ origin: config.corsOrigin, credentials: true }));
  app.all("/auth/*", toNodeHandler(auth));
  app.use(express.json({ limit: "64kb" }));
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

  return app;
}

export function registerErrorHandler(app: express.Application) {
  app.use(errorHandler);
}
