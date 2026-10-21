import type { ValidationTargets } from "hono";
import { validator } from "hono/validator";
import type { z, ZodTypeAny } from "zod";

// Validates one part of the request with zod; failures are 400 `{ error: "Invalid request", details }`
export const zodValidator = <Target extends keyof ValidationTargets, Schema extends ZodTypeAny>(
  target: Target,
  schema: Schema,
) =>
  validator(target, async (value, c) => {
    const parsed = await schema.safeParseAsync(value);
    if (!parsed.success) {
      return c.json({ error: "Invalid request", details: parsed.error.flatten().fieldErrors }, 400);
    }
    return parsed.data as z.output<Schema>;
  });
