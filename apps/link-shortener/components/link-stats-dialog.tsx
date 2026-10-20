"use client";

import { PuiChart, PuiDialog, PuiSkeleton } from "pui";
import { useLinkStats } from "@/lib/client/hooks/use-link-stats";
import type { LinkDto } from "@/lib/types/link-dto";

type LinkStatsDialogProps = { link: LinkDto | null; onClose: () => void };

export function LinkStatsDialog({ link, onClose }: LinkStatsDialogProps) {
  const stats = useLinkStats(link?.id ?? null);
  return (
    <PuiDialog
      open={!!link}
      onOpenChange={(open) => !open && onClose()}
      title={link ? `Clicks for /r/${link.slug}` : "Clicks"}
      description={stats.data ? `${stats.data.totalClicks} clicks in total · last 30 days` : "Last 30 days"}
      className="sm:max-w-2xl"
    >
      {stats.data ? (
        <PuiChart
          type="bar"
          data={stats.data.days.map((d) => ({ day: d.day.slice(5), clicks: d.count }))}
          xKey="day"
          series={[{ key: "clicks", label: "Clicks" }]}
          className="h-64"
        />
      ) : (
        <PuiSkeleton lines={6} />
      )}
    </PuiDialog>
  );
}
