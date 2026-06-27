import type { Request, Response } from "express";
import type { OkResponse } from "../types/api.js";
import { HttpError } from "../utils/httpError.js";

export const health = async (_req: Request, res: Response<OkResponse>): Promise<void> => {
  try {
    res.json({ ok: true });
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw error;
  }
};
