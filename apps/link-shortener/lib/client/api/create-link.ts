import { apiClient } from "@/lib/client/api-client";
import { linkEndpoints } from "@/lib/client/link-endpoints";
import { unwrap } from "@/lib/client/utils/unwrap";
import type { CreateLinkInput } from "@/lib/types/create-link-input";
import type { LinkDto } from "@/lib/types/link-dto";

export const createLink = async (input: CreateLinkInput): Promise<LinkDto> =>
  unwrap(await apiClient.post<LinkDto>(linkEndpoints.list(), input), "Failed to create link");
