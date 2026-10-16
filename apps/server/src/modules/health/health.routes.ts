import { Router } from "express";
import * as healthController from "./health.controller.js";
import { asyncHandler } from "@chat/backend-common";

const router = Router();

router.get("/health", asyncHandler(healthController.health));

export default router;
