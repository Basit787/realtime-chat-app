import { Router } from "express";
import type { Server } from "socket.io";
import type { AppAuth } from "../auth/auth.js";
import * as messageController from "./message.controller.js";
import { createAuthenticate } from "../auth/auth.middleware.js";
import { validateParams, asyncHandler } from "@chat/backend-common";
import { messageParamSchema, roomParamSchema } from "./message.validator.js";

export const createMessageRoutes = (io: Server, auth: AppAuth) => {
  const router = Router();
  const authenticate = createAuthenticate(auth);

  router.get(
    "/:room/messages",
    authenticate,
    validateParams(roomParamSchema),
    asyncHandler(messageController.getMessages),
  );

  router.delete(
    "/:room/messages/:id",
    authenticate,
    validateParams(messageParamSchema),
    asyncHandler((req, res) => messageController.deleteMessage(req, res, io)),
  );

  return router;
}
