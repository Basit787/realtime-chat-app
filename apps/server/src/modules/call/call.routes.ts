import { Router } from "express";
import type { AppAuth } from "../auth/auth.js";
import * as callController from "./call.controller.js";
import { createAuthenticate } from "../auth/auth.middleware.js";
import { asyncHandler } from "@chat/backend-common";

export const createCallRoutes = (auth: AppAuth) => {
  const router = Router();
  const authenticate = createAuthenticate(auth);

  router.get("/calls/history", authenticate, asyncHandler(callController.getCallHistory));
  router.get("/webrtc/config", authenticate, asyncHandler(callController.getWebRTCConfig));

  return router;
};
