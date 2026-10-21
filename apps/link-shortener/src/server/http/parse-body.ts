import type { ZodType } from "zod";
import { ApiError } from "./api-error";

// Parses and validates a JSON body; invalid input is a 400 with per-field messages
export async function parseBody<T>(request: Request, schema: ZodType<T>): Promise<T> {
  const body: unknown = await request.json().catch(() => undefined);
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw new ApiError(400, "Invalid request", parsed.error.flatten().fieldErrors);
  return parsed.data;
}
