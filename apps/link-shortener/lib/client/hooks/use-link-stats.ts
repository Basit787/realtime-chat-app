import { useQuery } from "@tanstack/react-query";
import { fetchLinkStats } from "@/lib/client/api/fetch-link-stats";
import { linkQueryKeys } from "@/lib/client/query-keys";

export const useLinkStats = (id: string | null) =>
  useQuery({ queryKey: linkQueryKeys.stats(id), queryFn: () => fetchLinkStats(id!), enabled: !!id });
