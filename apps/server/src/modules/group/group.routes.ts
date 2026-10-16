import { Router } from "express";
import type { AppAuth } from "../auth/auth.js";
import * as groupController from "./group.controller.js";
import { createAuthenticate } from "../auth/auth.middleware.js";
import { groupAvatarUploadMiddleware } from "./group.middleware.js";
import { asyncHandler } from "@chat/backend-common";

export const createGroupRoutes = (auth: AppAuth) => {
  const router = Router();
  const authenticate = createAuthenticate(auth);

  router.get("/", authenticate, asyncHandler(groupController.listGroups));
  router.post("/", authenticate, asyncHandler(groupController.createGroup));
  router.get("/:groupId/avatar", asyncHandler(groupController.getGroupAvatar));
  router.get("/:groupId", authenticate, asyncHandler(groupController.getGroup));
  router.patch("/:groupId", authenticate, asyncHandler(groupController.updateGroup));
  router.post(
    "/:groupId/avatar",
    authenticate,
    groupAvatarUploadMiddleware.single("photo"),
    asyncHandler(groupController.uploadGroupAvatar),
  );
  router.delete("/:groupId/avatar", authenticate, asyncHandler(groupController.removeGroupAvatar));

  return router;
}
