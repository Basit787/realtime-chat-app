import { Router } from "express";
import type { Server } from "socket.io";
import type { AppAuth } from "../auth/index.js";
import * as fileController from "../controllers/file.controller.js";
import { createAuthenticate } from "../middleware/auth.js";
import { validateParams } from "../middleware/validate.js";
import { uploadMiddleware } from "../middleware/upload.js";
import { fileParamSchema, roomParamSchema } from "../validators/file.validator.js";
import { asyncHandler } from "../utils/asyncHandler.js";

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
