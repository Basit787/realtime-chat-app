import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { links } from "./links";

// One redirect through a link, for per-day stats
export const clicks = pgTable(
  "clicks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    linkId: uuid("link_id")
      .notNull()
      .references(() => links.id, { onDelete: "cascade" }),
    referrer: text("referrer"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("clicks_link_id_created_at_idx").on(table.linkId, table.createdAt)],
);
