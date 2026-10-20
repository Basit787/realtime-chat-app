// React Query keys, so hooks and invalidations agree
export const linkQueryKeys = {
  all: ["links"] as const,
  stats: (id: string | null) => ["link-stats", id] as const,
};
