import type { Request, Response } from "express";
import { webRTCService } from "../services/webrtc.service.js";
import type { WebRTCConfigResponse } from "../types/api.js";
import { HttpError } from "../utils/httpError.js";

export const getWebRTCConfig = async (
  _req: Request,
  res: Response<WebRTCConfigResponse>,
): Promise<void> => {
  try {
    res.json(webRTCService.getIceServers());
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw error;
  }
};
