import { Router } from "express";
import type { Connection } from "mongoose";
import type { Server } from "socket.io";
import type { AppAuth } from "../auth/auth.js";
import { createContactsController, createProfileController } from "./user.controller.js";
import { createAuthenticate } from "../auth/auth.middleware.js";
import { avatarUploadMiddleware } from "./user.middleware.js";
import { createAvatarService } from "./user.service.js";
import { asyncHandler } from "@chat/backend-common";

export const createUserRoutes = (auth: AppAuth, connection: Connection, io: Server) => {
  const router = Router();
  const authenticate = createAuthenticate(auth);
  const profile = createProfileController(auth, createAvatarService(connection), io);
  const contacts = createContactsController(connection);

  router.get("/profile/avatars/by-name/:username", asyncHandler(profile.getAvatarByUsername));
  router.get("/profile/avatars/:userId", asyncHandler(profile.getAvatarByUserId));
  router.post(
    "/profile/avatar",
    authenticate,
    avatarUploadMiddleware.single("photo"),
    asyncHandler(profile.uploadAvatar),
  );
  router.delete("/profile/avatar", authenticate, asyncHandler(profile.removeAvatar));
  router.get("/profile/status", authenticate, asyncHandler(profile.getStatus));
  router.patch("/profile/status", authenticate, asyncHandler(profile.updateStatus));
  router.get("/contacts", authenticate, asyncHandler(contacts.listContacts));

  return router;
};
