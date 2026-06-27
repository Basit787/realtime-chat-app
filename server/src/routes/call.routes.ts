import { Router } from "express";
import type { AppAuth } from "../auth/index.js";
import * as callHistoryController from "../controllers/callHistory.controller.js";
import { createAuthenticate } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createCallRoutes = (auth: AppAuth) => {
  const router = Router();
  const authenticate = createAuthenticate(auth);

  router.get("/history", authenticate, asyncHandler(callHistoryController.getCallHistory));

  return router;
}
