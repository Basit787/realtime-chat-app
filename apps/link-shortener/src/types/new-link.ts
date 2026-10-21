import type { links } from "@/db/schema/links";

// Values for inserting a link
export type NewLink = typeof links.$inferInsert;
