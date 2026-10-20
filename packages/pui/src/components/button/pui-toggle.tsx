import * as React from "react";
import { Toggle } from "pui/ui/toggle";

type PuiToggleProps = React.ComponentProps<typeof Toggle> & { icon?: React.ReactNode; label?: React.ReactNode };

export function PuiToggle({ icon, label, children, ...props }: PuiToggleProps) {
  return (
    <Toggle {...props}>
      {icon}
      {label}
      {children}
    </Toggle>
  );
}
