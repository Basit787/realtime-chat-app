import type { ReactNode } from "react";
import { Progress } from "pui/ui/progress";

type PuiProgressProps = { value: number; label?: ReactNode; showValue?: boolean; className?: string };

export function PuiProgress({ value, label, showValue, className }: PuiProgressProps) {
  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="mb-1.5 flex justify-between text-sm">
          <span>{label}</span>
          {showValue && <span className="text-muted-foreground">{Math.round(value)}%</span>}
        </div>
      )}
      <Progress value={value} />
    </div>
  );
}
