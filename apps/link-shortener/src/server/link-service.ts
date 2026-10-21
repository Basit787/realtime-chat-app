import { linkRepository } from "@/db/link-repository";
import type { CreateLinkInput } from "@/types/create-link-input";
import type { LinkDto } from "@/types/link-dto";
import type { LinkStats } from "@/types/link-stats";
import type { UpdateLinkInput } from "@/types/update-link-input";
import { ApiError } from "./http/api-error";
import { lastDays } from "./utils/last-days";
import { toLinkDto } from "./utils/to-link-dto";
import { uniqueSlug } from "./utils/unique-slug";

const STATS_DAYS = 30;

const notFound = () => new ApiError(404, "Link not found");

// Business rules for links; route handlers stay thin
export const linkService = {
  async create(userId: string, input: CreateLinkInput): Promise<LinkDto> {
    const link = await linkRepository.create({
      userId,
      url: input.url,
      slug: await uniqueSlug(input.slug),
      title: input.title || null,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
    });
    return toLinkDto(link);
  },

  async list(userId: string): Promise<LinkDto[]> {
    return (await linkRepository.listForUser(userId)).map(toLinkDto);
  },

  async get(id: string, userId: string): Promise<LinkDto> {
    const link = await linkRepository.findForUser(id, userId);
    if (!link) throw notFound();
    return toLinkDto(link);
  },

  async update(id: string, userId: string, input: UpdateLinkInput): Promise<LinkDto> {
    const current = await linkRepository.findForUser(id, userId);
    if (!current) throw notFound();
    const slug = input.slug && input.slug !== current.slug ? await uniqueSlug(input.slug) : undefined;
    const link = await linkRepository.updateForUser(id, userId, {
      url: input.url,
      slug,
      title: input.title === undefined ? undefined : input.title || null,
      expiresAt: input.expiresAt === undefined ? undefined : input.expiresAt ? new Date(input.expiresAt) : null,
    });
    if (!link) throw notFound();
    return toLinkDto(link);
  },

  async remove(id: string, userId: string): Promise<void> {
    if (!(await linkRepository.deleteForUser(id, userId))) throw notFound();
  },

  async stats(id: string, userId: string): Promise<LinkStats> {
    const link = await linkRepository.findForUser(id, userId);
    if (!link) throw notFound();
    const { from, days } = lastDays(STATS_DAYS);
    const counts = new Map((await linkRepository.dailyClicks(id, from)).map((row) => [row.day, row.count]));
    return {
      linkId: id,
      totalClicks: link.clickCount,
      days: days.map((day) => ({ day, count: counts.get(day) ?? 0 })),
    };
  },

  // Target URL for a live slug, recording the click; null when unknown or expired
  async resolve(slug: string, referrer: string | null, userAgent: string | null): Promise<string | null> {
    const link = await linkRepository.findBySlug(slug);
    if (!link || (link.expiresAt && link.expiresAt.getTime() < Date.now())) return null;
    await linkRepository.recordClick(link.id, referrer, userAgent);
    return link.url;
  },
};
