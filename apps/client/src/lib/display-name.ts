import { z } from "zod";

const CONTROL_CHARS = /[\u0000-\u001F\u007F]/;

export const displayNameSchema = z
  .string()
  .trim()
  .min(1, "Display name is required")
  .min(2, "Display name must be at least 2 characters")
  .max(32, "Display name must be at most 32 characters")
  .refine((value) => !CONTROL_CHARS.test(value), "Display name contains invalid characters");
