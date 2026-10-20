import type { z } from "zod";
import type { updateLinkSchema } from "@/lib/validation/update-link-schema";

export type UpdateLinkInput = z.infer<typeof updateLinkSchema>;
