import type { ReactNode } from "react";
import { Marker, MarkerContent, MarkerIcon } from "pui/ui/marker";

type PuiMarkerProps = {
  children: ReactNode;
  icon?: ReactNode;
  variant?: "default" | "separator";
  className?: string;
};

// Inline status line in a conversation, e.g. "Today" or "Alex joined"
export function PuiMarker({ children, icon, variant, className }: PuiMarkerProps) {
  return (
    <Marker variant={variant} className={className}>
      {icon && <MarkerIcon>{icon}</MarkerIcon>}
      <MarkerContent>{children}</MarkerContent>
    </Marker>
  );
}
