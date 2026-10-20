import type { LinkDto } from "@/lib/types/link-dto";

export const isLinkExpired = (link: LinkDto) => !!link.expiresAt && new Date(link.expiresAt).getTime() < Date.now();
