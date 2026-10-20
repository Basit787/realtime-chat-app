import { apiClient } from "@/lib/client/api-client";
import { linkEndpoints } from "@/lib/client/link-endpoints";
import { unwrap } from "@/lib/client/utils/unwrap";
import type { LinkStats } from "@/lib/types/link-stats";

export const fetchLinkStats = async (id: string): Promise<LinkStats> =>
  unwrap(await apiClient.get<LinkStats>(linkEndpoints.stats(id)), "Failed to load stats");
