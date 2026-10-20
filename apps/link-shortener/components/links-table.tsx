"use client";

import { formatDistanceToNow } from "date-fns";
import { BarChart3, Copy, ExternalLink, Link2Off, MoreHorizontal, Trash2 } from "lucide-react";
import {
  Button,
  PuiAlertDialog,
  PuiBadge,
  PuiCard,
  PuiDropdownMenu,
  PuiEmpty,
  PuiSkeleton,
  PuiTable,
  PuiTooltip,
  useNotification,
} from "pui";
import { useState } from "react";
import { useDeleteLink } from "@/lib/client/hooks/use-delete-link";
import { useLinks } from "@/lib/client/hooks/use-links";
import { shortUrl } from "@/lib/client/utils/short-url";
import { isLinkExpired } from "@/lib/client/utils/is-link-expired";
import type { LinkDto } from "@/lib/types/link-dto";
import { LinkStatsDialog } from "./link-stats-dialog";

export function LinksTable() {
  const links = useLinks();
  const deleteLink = useDeleteLink();
  const { showSuccessNotification, showErrorNotification } = useNotification();
  const [statsFor, setStatsFor] = useState<LinkDto | null>(null);
  const [deleting, setDeleting] = useState<LinkDto | null>(null);

  const copy = async (link: LinkDto) => {
    try {
      await navigator.clipboard.writeText(shortUrl(link.shortPath));
      showSuccessNotification("Short link copied");
    } catch (error) {
      showErrorNotification(error, "Could not copy the link");
    }
  };

  return (
    <PuiCard title="Your links" description="Every short link you created, newest first.">
      {links.isLoading ? (
        <PuiSkeleton lines={4} />
      ) : !links.data?.length ? (
        <PuiEmpty icon={<Link2Off />} title="No links yet" description="Shorten your first URL above." />
      ) : (
        <PuiTable
          data={links.data}
          rowKey={(link) => link.id}
          columns={[
            {
              key: "short",
              header: "Short link",
              cell: (link) => (
                <div className="flex items-center gap-2">
                  <a
                    href={link.shortPath}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-primary hover:underline"
                  >
                    /r/{link.slug}
                  </a>
                  {isLinkExpired(link) && <PuiBadge variant="secondary">Expired</PuiBadge>}
                </div>
              ),
            },
            {
              key: "url",
              header: "Destination",
              cell: (link) => (
                <PuiTooltip text={link.url}>
                  <span className="block max-w-[18rem] truncate text-muted-foreground">{link.title || link.url}</span>
                </PuiTooltip>
              ),
            },
            { key: "clickCount", header: "Clicks", className: "text-right", cell: (link) => link.clickCount },
            {
              key: "createdAt",
              header: "Created",
              cell: (link) => formatDistanceToNow(new Date(link.createdAt), { addSuffix: true }),
            },
            {
              key: "actions",
              header: "",
              className: "w-12 text-right",
              cell: (link) => (
                <PuiDropdownMenu
                  items={[
                    { label: "Copy short link", icon: <Copy />, onSelect: () => void copy(link) },
                    {
                      label: "Open destination",
                      icon: <ExternalLink />,
                      onSelect: () => window.open(link.url, "_blank"),
                    },
                    { label: "Click stats", icon: <BarChart3 />, onSelect: () => setStatsFor(link) },
                    { type: "separator" },
                    { label: "Delete", icon: <Trash2 />, destructive: true, onSelect: () => setDeleting(link) },
                  ]}
                >
                  <Button variant="ghost" size="icon" aria-label="Link actions">
                    <MoreHorizontal />
                  </Button>
                </PuiDropdownMenu>
              ),
            },
          ]}
        />
      )}

      <LinkStatsDialog link={statsFor} onClose={() => setStatsFor(null)} />
      <PuiAlertDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this link?"
        description={deleting ? `/r/${deleting.slug} will stop working. This cannot be undone.` : undefined}
        confirmText="Delete"
        destructive
        onConfirm={() => deleting && deleteLink.mutate(deleting.id)}
      />
    </PuiCard>
  );
}
