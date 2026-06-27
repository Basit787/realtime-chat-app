import { Router } from "express";
import type { Connection } from "mongoose";
import type { Server } from "socket.io";
import type { AppAuth } from "../auth/index.js";
import { createProfileController } from "../controllers/profile.controller.js";
import { createAuthenticate } from "../middleware/auth.js";
import { avatarUploadMiddleware } from "../middleware/avatarUpload.js";
import { createAvatarService } from "../services/avatar.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createProfileRoutes = (auth: AppAuth, connection: Connection, io: Server) => {
  const router = Router();
  const authenticate = createAuthenticate(auth);
  const avatarService = createAvatarService(connection);
  const profile = createProfileController(auth, avatarService, io);

  router.get("/avatars/by-name/:username", asyncHandler(profile.getAvatarByUsername));
  router.get("/avatars/:userId", asyncHandler(profile.getAvatarByUserId));
  router.post(
    "/avatar",
    authenticate,
    avatarUploadMiddleware.single("photo"),
    asyncHandler(profile.uploadAvatar),
  );
  router.delete("/avatar", authenticate, asyncHandler(profile.removeAvatar));
  router.get("/status", authenticate, asyncHandler(profile.getStatus));
  router.patch("/status", authenticate, asyncHandler(profile.updateStatus));

  return router;
}
