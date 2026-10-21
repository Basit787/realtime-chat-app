import { z } from "zod";
import { slugSchema } from "./slug-schema";
import { urlSchema } from "./url-schema";

export const updateLinkSchema = z.object({
  url: urlSchema.optional(),
  slug: slugSchema.optional(),
  title: z.string().trim().max(200).optional(),
  // null clears the expiry
  expiresAt: z.string().datetime().nullable().optional(),
});
