import { apiClient } from "@/lib/client/api-client";
import { linkEndpoints } from "@/lib/client/link-endpoints";
import { unwrap } from "@/lib/client/utils/unwrap";

export const deleteLink = async (id: string): Promise<void> => {
  unwrap(await apiClient.delete<{ ok: true }>(linkEndpoints.link(id)), "Failed to delete link");
};
