import type { ReactNode } from "react";
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "pui/ui/item";

type PuiItemProps = {
  title: ReactNode;
  description?: ReactNode;
  // Icon or avatar on the left
  media?: ReactNode;
  // Buttons on the right
  actions?: ReactNode;
  variant?: "default" | "outline" | "muted";
  className?: string;
};

// List row: media, title, description and actions
export function PuiItem({ title, description, media, actions, variant, className }: PuiItemProps) {
  return (
    <Item variant={variant} className={className}>
      {media && <ItemMedia>{media}</ItemMedia>}
      <ItemContent>
        <ItemTitle>{title}</ItemTitle>
        {description && <ItemDescription>{description}</ItemDescription>}
      </ItemContent>
      {actions && <ItemActions>{actions}</ItemActions>}
    </Item>
  );
}
