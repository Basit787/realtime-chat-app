import type { ReactNode } from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "pui/ui/hover-card";

type PuiHoverCardProps = {
  content: ReactNode;
  children: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  openDelay?: number;
  className?: string;
};

export function PuiHoverCard({ content, children, side, align, openDelay, className }: PuiHoverCardProps) {
  return (
    <HoverCard openDelay={openDelay}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent side={side} align={align} className={className}>
        {content}
      </HoverCardContent>
    </HoverCard>
  );
}
