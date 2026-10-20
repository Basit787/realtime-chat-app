import type { ReactNode } from "react";
import { AspectRatio } from "pui/ui/aspect-ratio";
import { cn } from "pui/lib/utils";

type PuiAspectRatioProps = {
  ratio?: number;
  // Image source; or pass children instead
  src?: string;
  alt?: string;
  children?: ReactNode;
  className?: string;
};

export function PuiAspectRatio({ ratio = 16 / 9, src, alt = "", children, className }: PuiAspectRatioProps) {
  return (
    <AspectRatio ratio={ratio} className={cn("overflow-hidden rounded-lg bg-muted", className)}>
      {src ? <img src={src} alt={alt} className="size-full object-cover" /> : children}
    </AspectRatio>
  );
}
