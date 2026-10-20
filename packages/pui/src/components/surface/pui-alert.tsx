import type { ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "pui/ui/alert";

type PuiAlertProps = {
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  variant?: "default" | "destructive";
  className?: string;
};

export function PuiAlert({ title, description, icon, variant, className }: PuiAlertProps) {
  return (
    <Alert variant={variant} className={className}>
      {icon}
      {title && <AlertTitle>{title}</AlertTitle>}
      {description && <AlertDescription>{description}</AlertDescription>}
    </Alert>
  );
}
