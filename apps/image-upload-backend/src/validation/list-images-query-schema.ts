import { z } from "zod";
import { pageQuerySchema } from "./page-query-schema.js";

// Query of GET /images: one status per page of results
export const listImagesQuerySchema = pageQuerySchema.extend({
  status: z.enum(["active", "scheduled"]).default("active"),
});
