import { Router } from "express";
import type { Server } from "socket.io";
import type { AppAuth } from "../auth/auth.js";
import * as fileController from "./file.controller.js";
import { createAuthenticate } from "../auth/auth.middleware.js";
import { validateParams, asyncHandler } from "@chat/backend-common";
import { uploadMiddleware } from "./file.middleware.js";
import { fileParamSchema, roomParamSchema } from "./file.validator.js";

export const createFileRoutes = (io: Server, auth: AppAuth) => {
  const router = Router({ mergeParams: true });
  const authenticate = createAuthenticate(auth);

  router.post(
    "/:room/files",
    authenticate,
    validateParams(roomParamSchema),
    uploadMiddleware.single("file"),
    asyncHandler((req, res) => fileController.uploadFile(req, res, io)),
  );

  router.get(
    "/:room/files/:id",
    authenticate,
    validateParams(fileParamSchema),
    asyncHandler((req, res) => fileController.downloadFile(req, res)),
  );

  return router;
}
