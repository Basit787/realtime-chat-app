import { Router } from "express";
import type { AppAuth } from "../auth/index.js";
import * as groupController from "../controllers/group.controller.js";
import { createAuthenticate } from "../middleware/auth.js";
import { groupAvatarUploadMiddleware } from "../middleware/groupAvatarUpload.js";
import { asyncHandler } from "../utils/asyncHandler.js";

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
