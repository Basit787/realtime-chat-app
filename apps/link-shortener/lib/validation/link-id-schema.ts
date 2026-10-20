import { z } from "zod";

// Link ids are UUIDs; anything else cannot exist
export const linkIdSchema = z.string().uuid();
