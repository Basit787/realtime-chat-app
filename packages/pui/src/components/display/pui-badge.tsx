import * as React from "react";
import { Badge } from "pui/ui/badge";

type PuiBadgeProps = React.ComponentProps<typeof Badge> & { icon?: React.ReactNode };

export function PuiBadge({ icon, children, ...props }: PuiBadgeProps) {
  return (
    <Badge {...props}>
      {icon}
      {children}
    </Badge>
  );
}
