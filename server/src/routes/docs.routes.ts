import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import { openApiDocument } from "../docs/openapi.js";

const router = Router();

router.get("/openapi.json", (_req, res) => {
  res.json(openApiDocument);
});

router.use(swaggerUi.serve);
router.get("/", swaggerUi.setup(openApiDocument, { customSiteTitle: "Realtime Chat API" }));

export default router;
