import * as React from "react";
import { ToggleGroup, ToggleGroupItem } from "pui/ui/toggle-group";

type PuiToggleGroupItem = {
  value: string;
  label?: React.ReactNode;
  icon?: React.ReactNode;
  ariaLabel?: string;
  disabled?: boolean;
};

// Keeps the single / multiple union intact while dropping `children`
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

type PuiToggleGroupProps = DistributiveOmit<React.ComponentProps<typeof ToggleGroup>, "children"> & {
  items: PuiToggleGroupItem[];
};

export function PuiToggleGroup({ items, ...props }: PuiToggleGroupProps) {
  return (
    <ToggleGroup {...props}>
      {items.map((item) => (
        <ToggleGroupItem key={item.value} value={item.value} aria-label={item.ariaLabel} disabled={item.disabled}>
          {item.icon}
          {item.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
