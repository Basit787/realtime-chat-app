import { z } from "zod";

export const imageIdParamsSchema = z.object({ id: z.string().uuid("Invalid image id") });
