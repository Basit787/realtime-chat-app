import type { Express } from "express";
import type { Server } from "socket.io";
import type { AppAuth } from "../auth/index.js";
import { createAuthenticate } from "../middleware/auth.js";
import docsRoutes from "./docs.routes.js";
import healthRoutes from "./health.routes.js";
import { createFileRoutes } from "./file.routes.js";
import { createMessageRoutes } from "./message.routes.js";
import webrtcRoutes from "./webrtc.routes.js";

export function registerRoutes(app: Express, io: Server, auth: AppAuth) {
  const authenticate = createAuthenticate(auth);

  app.use("/docs", docsRoutes);
  app.use(healthRoutes);
  app.use("/webrtc", webrtcRoutes(authenticate));
  app.use("/rooms", createMessageRoutes(io, auth));
  app.use("/rooms", createFileRoutes(io, auth));
}
