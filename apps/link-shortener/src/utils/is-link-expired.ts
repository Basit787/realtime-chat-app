import type { LinkDto } from "@/types/link-dto";

export const isLinkExpired = (link: LinkDto) => !!link.expiresAt && new Date(link.expiresAt).getTime() < Date.now();
