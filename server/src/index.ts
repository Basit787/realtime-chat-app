import mongoose from "mongoose";
import { createServer } from "http";
import { Server } from "socket.io";
import { createAuth } from "./auth/index.js";
import { createApp, registerErrorHandler } from "./app.js";
import { config } from "./config/index.js";
import { connectDb } from "./db/index.js";
import { seedAdmin } from "./db/seed-admin.js";
import { objectStorage } from "./services/objectStorage.service.js";
import { registerRoutes } from "./routes/index.js";
import { setupSocket } from "./socket/index.js";

const start = async () => {
  if (!config.minio.endpoint) {
    throw new Error("MINIO_ENDPOINT is required. All uploads are stored in MinIO.");
  }

  await Promise.all([connectDb(config.mongodbUri), objectStorage.ensureReady()]);
  await seedAdmin(mongoose.connection).catch((err) => console.warn("Seed skipped:", err));

  const auth = createAuth(mongoose.connection);
  const app = createApp(auth);
  const httpServer = createServer(app);
  const io = new Server(httpServer, { cors: { origin: config.corsOrigin } });

  registerRoutes(app, io, auth, mongoose.connection);
  setupSocket(io, auth);
  registerErrorHandler(app);

  httpServer.listen(config.port, () => console.log(`Chat server http://localhost:${config.port}`));
};

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
