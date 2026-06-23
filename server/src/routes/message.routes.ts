import { Router } from "express";
import type { Server } from "socket.io";
import type { AppAuth } from "../auth/index.js";
import * as messageController from "../controllers/message.controller.js";
import { createAuthenticate, createRequireRole } from "../middleware/auth.js";
import { validateParams } from "../middleware/validate.js";
import { messageParamSchema, roomParamSchema } from "../validators/message.validator.js";
import { ROLES } from "../types/role.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export function createMessageRoutes(io: Server, auth: AppAuth) {
  const router = Router();
  const authenticate = createAuthenticate(auth);
  const adminOnly = createRequireRole(auth, ROLES.ADMIN);

  router.get(
    "/:room/messages",
    authenticate,
    validateParams(roomParamSchema),
    asyncHandler(messageController.getMessages),
  );

  router.delete(
    "/:room/messages/:id",
    ...adminOnly,
    validateParams(messageParamSchema),
    asyncHandler((req, res) => messageController.deleteMessage(req, res, io)),
  );

  return router;
}
