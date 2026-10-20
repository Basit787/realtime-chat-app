import type { links } from "@/lib/db/schema/links";

// Values for inserting a link
export type NewLink = typeof links.$inferInsert;
