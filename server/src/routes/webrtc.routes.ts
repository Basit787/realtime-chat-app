import { Router, type RequestHandler } from "express";
import * as webrtcController from "../controllers/webrtc.controller.js";

export default function webrtcRoutes(authenticate: RequestHandler) {
  const router = Router();
  router.get("/config", authenticate, webrtcController.getWebRTCConfig);
  return router;
}
