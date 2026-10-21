import { z } from "zod";
import { slugSchema } from "./slug-schema";
import { urlSchema } from "./url-schema";

export const createLinkSchema = z.object({
  url: urlSchema,
  slug: slugSchema.optional(),
  title: z.string().trim().max(200).optional(),
  expiresAt: z.string().datetime().optional(),
});
