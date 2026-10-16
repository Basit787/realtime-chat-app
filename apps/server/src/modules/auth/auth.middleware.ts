import type { NextFunction, Request, Response } from "express";
import type { AppAuth } from "./auth.js";
import { getSessionUser } from "./auth.service.js";
import { catchMiddleware } from "@chat/backend-common";
import type { Role } from "../../types/role.js";

export const createAuthenticate = (auth: AppAuth) => {
  const authenticateHandler = (req: Request, res: Response, next: NextFunction) => {
    getSessionUser(auth, req.headers)
      .then((user) => {
        if (!user) {
          res.status(401).json({ error: "Authentication required" });
          return;
        }
        req.user = user;
        next();
      })
      .catch((error) => {
        throw new Error(error instanceof Error ? error.message : "Authentication failed");
      });
  };

  return catchMiddleware(authenticateHandler);
};

export const createRequireRole = (auth: AppAuth, ...roles: Role[]) => {
  const authenticate = createAuthenticate(auth);

  const requireRoleHandler = (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }
      if (!roles.includes(req.user.role)) {
        res.status(403).json({ error: "Insufficient permissions" });
        return;
      }
      next();
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Authorization failed");
    }
  };

  return [authenticate, catchMiddleware(requireRoleHandler)] as const;
};
