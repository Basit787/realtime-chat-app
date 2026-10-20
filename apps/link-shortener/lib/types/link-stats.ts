// Click stats for one link, as the API returns them
export type LinkStats = {
  linkId: string;
  totalClicks: number;
  // Last 30 days, one entry per day
  days: { day: string; count: number }[];
};
