import type { Express } from "express";
import type { Server } from "socket.io";
import type { AppAuth } from "../auth/index.js";
import { createAuthenticate } from "../middleware/auth.js";
import docsRoutes from "./docs.routes.js";
import healthRoutes from "./health.routes.js";
import { createFileRoutes } from "./file.routes.js";
import { createMessageRoutes } from "./message.routes.js";
import webrtcRoutes from "./webrtc.routes.js";
import { createCallRoutes } from "./call.routes.js";
import { createGroupRoutes } from "./group.routes.js";
import { createProfileRoutes } from "./profile.routes.js";
import { createContactsRoutes } from "./contacts.routes.js";
import type { Connection } from "mongoose";

export const registerRoutes = (app: Express, io: Server, auth: AppAuth, connection: Connection) => {
  const authenticate = createAuthenticate(auth);

  app.use("/docs", docsRoutes);
  app.use(healthRoutes);
  app.use("/webrtc", webrtcRoutes(authenticate));
  app.use("/calls", createCallRoutes(auth));
  app.use("/contacts", createContactsRoutes(auth, connection));
  app.use("/groups", createGroupRoutes(auth));
  app.use("/profile", createProfileRoutes(auth, connection, io));
  app.use("/rooms", createMessageRoutes(io, auth));
  app.use("/rooms", createFileRoutes(io, auth));
}
