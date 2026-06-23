import type { Request, Response } from "express";
import type { OkResponse } from "../types/api.js";

export function health(_req: Request, res: Response<OkResponse>): void {
  res.json({ ok: true });
}
