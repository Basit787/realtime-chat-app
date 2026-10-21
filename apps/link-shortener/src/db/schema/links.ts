import { index, integer, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

// One short link; `slug` is the path segment after /r/
export const links = pgTable(
  "links",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 64 }).notNull().unique(),
    url: text("url").notNull(),
    title: varchar("title", { length: 200 }),
    // Owner: the auth service's user id
    userId: varchar("user_id", { length: 64 }).notNull(),
    clickCount: integer("click_count").notNull().default(0),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("links_user_id_idx").on(table.userId)],
);
