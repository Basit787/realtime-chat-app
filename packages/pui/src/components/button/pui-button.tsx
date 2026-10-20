import * as React from "react";
import { Button } from "pui/ui/button";
import { Spinner } from "pui/ui/spinner";

type PuiButtonProps = React.ComponentProps<typeof Button> & {
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
};

// Button with optional icons and a loading spinner that also disables it
export function PuiButton({ loading, icon, iconRight, disabled, children, ...props }: PuiButtonProps) {
  return (
    <Button disabled={disabled || loading} {...props}>
      {loading ? <Spinner /> : icon}
      {children}
      {iconRight}
    </Button>
  );
}
