import type { ReactNode } from "react";
import { Separator } from "pui/ui/separator";
import { cn } from "pui/lib/utils";

type PuiSeparatorProps = { label?: ReactNode; orientation?: "horizontal" | "vertical"; className?: string };

// Divider, optionally with centred text such as "or"
export function PuiSeparator({ label, orientation, className }: PuiSeparatorProps) {
  if (!label) return <Separator orientation={orientation} className={className} />;
  return (
    <div className={cn("flex items-center gap-3 text-xs text-muted-foreground", className)}>
      <Separator className="flex-1" />
      <span>{label}</span>
      <Separator className="flex-1" />
    </div>
  );
}
