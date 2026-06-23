import type { NextFunction, Request, RequestHandler, Response } from "express";

export function catchMiddleware(fn: RequestHandler): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      fn(req, res, next);
    } catch (error) {
      next(error instanceof Error ? error : new Error(String(error)));
    }
  };
}
