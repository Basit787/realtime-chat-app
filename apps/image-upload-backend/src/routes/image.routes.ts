import { Hono } from "hono";
import { imageController } from "../controllers/image.controller.js";
import { requireAuth } from "../middleware/require-auth.js";
import type { AppEnv } from "../types/app-env.js";

// /images: the signed-in user's gallery
export const imageRoutes = new Hono<AppEnv>()
  .use(requireAuth)
  .get("/", ...imageController.list)
  .get("/bin", ...imageController.bin)
  .get("/counts", ...imageController.counts)
  .post("/", ...imageController.upload)
  .get("/:id/file", ...imageController.file)
  .delete("/:id", ...imageController.remove)
  .post("/:id/restore", ...imageController.restore)
  .delete("/:id/permanent", ...imageController.purge);
