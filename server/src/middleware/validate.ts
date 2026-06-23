import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";
import { catchMiddleware } from "../utils/catchMiddleware.js";

function validateBodyHandler<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.body);
      if (!result.success) {
        res.status(400).json({ error: "Validation failed", details: result.error.flatten().fieldErrors });
        return;
      }
      req.body = result.data;
      next();
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Failed to validate request body");
    }
  };
}

function validateParamsHandler<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.params);
      if (!result.success) {
        res.status(400).json({ error: "Validation failed", details: result.error.flatten().fieldErrors });
        return;
      }
      req.params = result.data as Request["params"];
      next();
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Failed to validate request params");
    }
  };
}

export function validateBody<T>(schema: ZodSchema<T>) {
  return catchMiddleware(validateBodyHandler(schema));
}

export function validateParams<T>(schema: ZodSchema<T>) {
  return catchMiddleware(validateParamsHandler(schema));
}
