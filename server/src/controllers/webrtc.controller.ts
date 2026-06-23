import type { Request, Response } from "express";
import { webRTCService } from "../services/webrtc.service.js";
import type { WebRTCConfigResponse } from "../types/api.js";

export function getWebRTCConfig(_req: Request, res: Response<WebRTCConfigResponse>): void {
  res.json(webRTCService.getIceServers());
}
