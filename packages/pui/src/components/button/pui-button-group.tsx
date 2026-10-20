import * as React from "react";
import { Button } from "pui/ui/button";
import { ButtonGroup } from "pui/ui/button-group";

type PuiButtonGroupItem = {
  label?: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
};

type PuiButtonGroupProps = {
  items: PuiButtonGroupItem[];
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
  orientation?: "horizontal" | "vertical";
  className?: string;
};

export function PuiButtonGroup({ items, variant = "outline", size, orientation, className }: PuiButtonGroupProps) {
  return (
    <ButtonGroup orientation={orientation} className={className}>
      {items.map((item, index) => (
        <Button
          key={index}
          variant={variant}
          size={size}
          onClick={item.onClick}
          disabled={item.disabled}
          aria-label={item.ariaLabel}
        >
          {item.icon}
          {item.label}
        </Button>
      ))}
    </ButtonGroup>
  );
}
