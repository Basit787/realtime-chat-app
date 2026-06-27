import type { NextFunction, Request, Response } from "express";
import type { ZodError } from "zod";
import type { ApiErrorResponse } from "../types/api.js";
import { HttpError } from "../utils/httpError.js";

const isZodError = (err: unknown): err is ZodError =>
  typeof err === "object" && err !== null && "name" in err && err.name === "ZodError";

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response<ApiErrorResponse>,
  _next: NextFunction,
): void => {
  if (err instanceof HttpError) {
    const body: ApiErrorResponse = { error: err.message };
    if (err.details) {
      body.details = err.details;
    }
    res.status(err.statusCode).json(body);
    return;
  }
  if (isZodError(err)) {
    res.status(400).json({ error: "Validation failed", details: err.flatten().fieldErrors });
    return;
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
};
