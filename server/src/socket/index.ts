import type { Server } from "socket.io";
import type { AppAuth } from "../auth/index.js";
import { registerSocketHandlers } from "./handlers.js";
import { createSocketAuth } from "./middleware.js";

export const setupSocket = (io: Server, auth: AppAuth) => {
  io.use(createSocketAuth(auth));
  registerSocketHandlers(io);
};
