import type { AppConfig } from "../types/config.js";

export const config: AppConfig = {
  port: Number(process.env.PORT) || 3004,
  mongodbUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/realtime_chat",
  betterAuthSecret: process.env.BETTER_AUTH_SECRET || process.env.JWT_SECRET || "chat-dev-secret-change-me",
  betterAuthUrl: process.env.BETTER_AUTH_URL || "http://localhost:5176",
  corsOrigin: process.env.CORS_ORIGIN?.split(",") ?? ["http://localhost:5176", "http://localhost:80"],
  uploadDir: process.env.UPLOAD_DIR || "./uploads",
  maxFileSizeMb: Number(process.env.MAX_FILE_SIZE_MB) || 25,
  turnHost: process.env.TURN_HOST || "localhost",
  turnPort: Number(process.env.TURN_PORT) || 3478,
  turnUser: process.env.TURN_USER || "chat",
  turnPassword: process.env.TURN_PASSWORD || "chatpass",
};
