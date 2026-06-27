import { Router } from "express";
import type { Server } from "socket.io";
import type { AppAuth } from "../auth/index.js";
import * as messageController from "../controllers/message.controller.js";
import { createAuthenticate } from "../middleware/auth.js";
import { validateParams } from "../middleware/validate.js";
import { messageParamSchema, roomParamSchema } from "../validators/message.validator.js";
import { asyncHandler } from "../utils/asyncHandler.js";

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
