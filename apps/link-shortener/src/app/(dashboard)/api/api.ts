import { apiClient } from "@/lib/api-client";
import type { CreateLinkInput } from "@/types/create-link-input";
import type { LinkDto } from "@/types/link-dto";
import type { LinkStats } from "@/types/link-stats";
import { unwrap } from "@/utils/unwrap";
import { linkEndpoints } from "./endpoint";

export const fetchLinks = async (): Promise<LinkDto[]> =>
  unwrap(await apiClient.get<{ links: LinkDto[] }>(linkEndpoints.list()), "Failed to load links").links;

export const createLink = async (input: CreateLinkInput): Promise<LinkDto> =>
  unwrap(await apiClient.post<LinkDto>(linkEndpoints.list(), input), "Failed to create link");

export const deleteLink = async (id: string): Promise<void> => {
  unwrap(await apiClient.delete<{ ok: true }>(linkEndpoints.link(id)), "Failed to delete link");
};

export const fetchLinkStats = async (id: string): Promise<LinkStats> =>
  unwrap(await apiClient.get<LinkStats>(linkEndpoints.stats(id)), "Failed to load stats");
