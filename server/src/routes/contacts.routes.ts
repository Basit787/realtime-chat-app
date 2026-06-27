import { Router } from "express";
import type { Connection } from "mongoose";
import type { AppAuth } from "../auth/index.js";
import { createContactsController } from "../controllers/contacts.controller.js";
import { createAuthenticate } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createContactsRoutes = (auth: AppAuth, connection: Connection) => {
  const router = Router();
  const authenticate = createAuthenticate(auth);
  const contacts = createContactsController(connection);

  router.get("/", authenticate, asyncHandler(contacts.listContacts));

  return router;
}
