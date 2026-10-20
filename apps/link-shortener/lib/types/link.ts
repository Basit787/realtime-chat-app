import type { links } from "@/lib/db/schema/links";

// A row of the links table
export type Link = typeof links.$inferSelect;
