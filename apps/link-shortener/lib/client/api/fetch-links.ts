import { apiClient } from "@/lib/client/api-client";
import { linkEndpoints } from "@/lib/client/link-endpoints";
import { unwrap } from "@/lib/client/utils/unwrap";
import type { LinkDto } from "@/lib/types/link-dto";

export const fetchLinks = async (): Promise<LinkDto[]> =>
  unwrap(await apiClient.get<{ links: LinkDto[] }>(linkEndpoints.list()), "Failed to load links").links;
