import { useQuery } from "@tanstack/react-query";
import { fetchLinks } from "@/lib/client/api/fetch-links";
import { linkQueryKeys } from "@/lib/client/query-keys";

export const useLinks = () => useQuery({ queryKey: linkQueryKeys.all, queryFn: fetchLinks });
