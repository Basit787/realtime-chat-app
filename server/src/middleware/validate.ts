import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";
import { catchMiddleware } from "../utils/catchMiddleware.js";

const validateBodyHandler = <T>(schema: ZodSchema<T>) => {
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
};

const validateParamsHandler = <T>(schema: ZodSchema<T>) => {
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
};

export const validateBody = <T>(schema: ZodSchema<T>) => catchMiddleware(validateBodyHandler(schema));

export const validateParams = <T>(schema: ZodSchema<T>) => catchMiddleware(validateParamsHandler(schema));
