import type { Request, Response } from "express";
import { callHistoryService, webRTCService } from "./call.service.js";
import type { ApiErrorResponse, CallHistoryListResponse, WebRTCConfigResponse } from "../../types/api.js";
import { HttpError } from "@chat/backend-common";

export const getCallHistory = async (
  req: Request,
  res: Response<CallHistoryListResponse | ApiErrorResponse>,
): Promise<void> => {
  try {
    if (!req.user) {
      throw new HttpError(401, "Unauthorized");
    }

    const peer = typeof req.query.peer === "string" ? req.query.peer : undefined;
    const calls = await callHistoryService.getUserHistory(req.user.username, peer);
    res.json({ calls });
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw error;
  }
};

export const getWebRTCConfig = async (_req: Request, res: Response<WebRTCConfigResponse>): Promise<void> => {
  try {
    res.json(webRTCService.getIceServers());
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw error;
  }
};
