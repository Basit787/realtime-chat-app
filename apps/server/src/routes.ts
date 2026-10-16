import type { Express } from "express";
import type { Server } from "socket.io";
import type { AppAuth } from "./modules/auth/auth.js";
import docsRoutes from "./docs/docs.routes.js";
import healthRoutes from "./modules/health/health.routes.js";
import { createFileRoutes } from "./modules/file/file.routes.js";
import { createMessageRoutes } from "./modules/message/message.routes.js";
import { createCallRoutes } from "./modules/call/call.routes.js";
import { createGroupRoutes } from "./modules/group/group.routes.js";
import { createUserRoutes } from "./modules/user/user.routes.js";
import type { Connection } from "mongoose";

export const registerRoutes = (app: Express, io: Server, auth: AppAuth, connection: Connection) => {
  app.use("/docs", docsRoutes);
  app.use(healthRoutes);
  // Call and user routes declare full paths: /calls, /webrtc and /profile, /contacts
  app.use(createCallRoutes(auth));
  app.use(createUserRoutes(auth, connection, io));
  app.use("/groups", createGroupRoutes(auth));
  app.use("/rooms", createMessageRoutes(io, auth));
  app.use("/rooms", createFileRoutes(io, auth));
};
