import { Router, type RequestHandler } from "express";
import * as webrtcController from "../controllers/webrtc.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const webrtcRoutes = (authenticate: RequestHandler) => {
  const router = Router();
  router.get("/config", authenticate, asyncHandler(webrtcController.getWebRTCConfig));
  return router;
};

export default webrtcRoutes;
