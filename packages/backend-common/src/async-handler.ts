import type { NextFunction, Request, Response, RequestHandler } from "express";

type AsyncRequestHandler = (req: Request, res: Response) => Promise<void>;

export const asyncHandler = (fn: AsyncRequestHandler): RequestHandler => {
  return (req, res, next: NextFunction) => {
    Promise.resolve(fn(req, res)).catch(next);
  };
};
