import type { ReactNode } from "react";
import { Spinner } from "pui/ui/spinner";
import { cn } from "pui/lib/utils";

type PuiSpinnerProps = { label?: ReactNode; className?: string };

export function PuiSpinner({ label, className }: PuiSpinnerProps) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-sm text-muted-foreground", className)}>
      <Spinner />
      {label}
    </span>
  );
}
