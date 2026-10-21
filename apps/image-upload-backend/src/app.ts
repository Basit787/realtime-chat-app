import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error-handler.js";
import { imageRoutes } from "./routes/image.routes.js";

export const createApp = () =>
  new Hono()
    .use(
      secureHeaders({
        crossOriginResourcePolicy: "cross-origin",
        // HSTS only in production: received over dev HTTPS it forces https on every localhost port for a year
        strictTransportSecurity: process.env.NODE_ENV === "production",
      }),
    )
    .use(cors({ origin: env.corsOrigin, credentials: true }))
    .get("/health", (c) => c.json({ ok: true as const }))
    .route("/images", imageRoutes)
    .notFound((c) => c.json({ error: "Not found" }, 404))
    .onError(errorHandler);
