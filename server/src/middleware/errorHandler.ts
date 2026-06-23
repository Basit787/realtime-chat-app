import type { NextFunction, Request, Response } from "express";
import type { ZodError } from "zod";
import type { ApiErrorResponse } from "../types/api.js";

export function errorHandler(err: unknown, _req: Request, res: Response<ApiErrorResponse>, _next: NextFunction): void {
  if (isZodError(err)) {
    res.status(400).json({ error: "Validation failed", details: err.flatten().fieldErrors });
    return;
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
}

function isZodError(err: unknown): err is ZodError {
  return typeof err === "object" && err !== null && "name" in err && err.name === "ZodError";
}
