import { z } from "zod";

// Multipart body of POST /images: one image under `file`, optionally published later at `scheduledAt`
export const uploadImageSchema = z.object({
  file: z
    .instanceof(File, { message: "No image uploaded" })
    .refine((file) => file.size > 0, "The file is empty")
    .refine((file) => file.type.startsWith("image/"), "Only image files are allowed"),
  scheduledAt: z
    .string()
    .datetime({ offset: true, message: "Must be an ISO date-time" })
    .transform((value) => new Date(value))
    .refine((date) => date.getTime() > Date.now(), "Must be in the future")
    .optional(),
});
