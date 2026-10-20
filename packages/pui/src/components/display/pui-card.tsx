import type { ReactNode } from "react";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "pui/ui/card";

type PuiCardProps = {
  title?: ReactNode;
  description?: ReactNode;
  // Element in the header's top-right corner, e.g. a button
  action?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  className?: string;
};

export function PuiCard({ title, description, action, footer, children, className }: PuiCardProps) {
  return (
    <Card className={className}>
      {(title || description || action) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
          {action && <CardAction>{action}</CardAction>}
        </CardHeader>
      )}
      {children && <CardContent>{children}</CardContent>}
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  );
}
