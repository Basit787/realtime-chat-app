import type { z } from "zod";
import type { createLinkSchema } from "@/lib/validation/create-link-schema";

export type CreateLinkInput = z.infer<typeof createLinkSchema>;
