import type { ReactNode } from "react";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "pui/ui/empty";

type PuiEmptyProps = {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  // Buttons or links under the text
  action?: ReactNode;
  className?: string;
};

// Empty state: nothing here yet
export function PuiEmpty({ title, description, icon, action, className }: PuiEmptyProps) {
  return (
    <Empty className={className}>
      <EmptyHeader>
        {icon && <EmptyMedia variant="icon">{icon}</EmptyMedia>}
        <EmptyTitle>{title}</EmptyTitle>
        {description && <EmptyDescription>{description}</EmptyDescription>}
      </EmptyHeader>
      {action && <EmptyContent>{action}</EmptyContent>}
    </Empty>
  );
}
