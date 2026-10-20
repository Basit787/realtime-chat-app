import { and, desc, eq, gte, sql } from "drizzle-orm";
import type { Link } from "@/lib/types/link";
import type { NewLink } from "@/lib/types/new-link";
import { db } from "./client";
import { clicks } from "./schema/clicks";
import { links } from "./schema/links";

// Data access for links and clicks; every owner-scoped query filters by userId
export const linkRepository = {
  async create(data: NewLink): Promise<Link> {
    const [link] = await db.insert(links).values(data).returning();
    return link;
  },

  listForUser(userId: string): Promise<Link[]> {
    return db.select().from(links).where(eq(links.userId, userId)).orderBy(desc(links.createdAt));
  },

  async findForUser(id: string, userId: string): Promise<Link | null> {
    const [link] = await db
      .select()
      .from(links)
      .where(and(eq(links.id, id), eq(links.userId, userId)));
    return link ?? null;
  },

  async findBySlug(slug: string): Promise<Link | null> {
    const [link] = await db.select().from(links).where(eq(links.slug, slug));
    return link ?? null;
  },

  async slugExists(slug: string): Promise<boolean> {
    const [row] = await db.select({ id: links.id }).from(links).where(eq(links.slug, slug));
    return !!row;
  },

  async updateForUser(id: string, userId: string, data: Partial<NewLink>): Promise<Link | null> {
    const [link] = await db
      .update(links)
      .set(data)
      .where(and(eq(links.id, id), eq(links.userId, userId)))
      .returning();
    return link ?? null;
  },

  async deleteForUser(id: string, userId: string): Promise<boolean> {
    const rows = await db
      .delete(links)
      .where(and(eq(links.id, id), eq(links.userId, userId)))
      .returning({ id: links.id });
    return rows.length > 0;
  },

  async recordClick(linkId: string, referrer: string | null, userAgent: string | null): Promise<void> {
    await db.transaction(async (tx) => {
      await tx.insert(clicks).values({ linkId, referrer, userAgent });
      await tx
        .update(links)
        .set({ clickCount: sql`${links.clickCount} + 1` })
        .where(eq(links.id, linkId));
    });
  },

  // Clicks per UTC day since `from`, oldest first
  dailyClicks(linkId: string, from: Date): Promise<{ day: string; count: number }[]> {
    const day = sql<string>`to_char(date_trunc('day', ${clicks.createdAt} at time zone 'UTC'), 'YYYY-MM-DD')`;
    return db
      .select({ day, count: sql<number>`count(*)::int` })
      .from(clicks)
      .where(and(eq(clicks.linkId, linkId), gte(clicks.createdAt, from)))
      .groupBy(day)
      .orderBy(day);
  },
};
