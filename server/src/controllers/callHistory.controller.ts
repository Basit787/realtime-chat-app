import type { Request, Response } from "express";
import { callHistoryService } from "../services/callHistory.service.js";
import type { ApiErrorResponse, CallHistoryListResponse } from "../types/api.js";
import { HttpError } from "../utils/httpError.js";

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
