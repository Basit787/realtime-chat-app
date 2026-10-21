import type { Link } from "@/types/link";
import type { LinkDto } from "@/types/link-dto";

export const toLinkDto = (link: Link): LinkDto => ({
  id: link.id,
  slug: link.slug,
  shortPath: `/r/${link.slug}`,
  url: link.url,
  title: link.title,
  clickCount: link.clickCount,
  expiresAt: link.expiresAt?.toISOString() ?? null,
  createdAt: link.createdAt.toISOString(),
  updatedAt: link.updatedAt.toISOString(),
});
