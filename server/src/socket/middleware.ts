import type { Socket } from "socket.io";
import type { AppAuth } from "../auth/index.js";
import { getBearerHeaders, getSessionUser } from "../auth/session.js";

export function createSocketAuth(auth: AppAuth) {
  return async (socket: Socket, next: (err?: Error) => void): Promise<void> => {
    try {
      const token = socket.handshake.auth.token as string | undefined;
      if (!token) {
        next(new Error("Unauthorized"));
        return;
      }
      const user = await getSessionUser(auth, getBearerHeaders(token));
      if (!user) {
        next(new Error("Unauthorized"));
        return;
      }
      socket.data.user = user;
      next();
    } catch (error) {
      next(new Error(error instanceof Error ? error.message : "Socket authentication failed"));
    }
  };
}
