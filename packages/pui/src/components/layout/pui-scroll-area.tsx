import * as React from "react";
import { ScrollArea } from "pui/ui/scroll-area";

type PuiScrollAreaProps = React.ComponentProps<typeof ScrollArea> & {
  // Fixed height, e.g. 300 or "50vh"
  height?: number | string;
};

export function PuiScrollArea({ height, style, ...props }: PuiScrollAreaProps) {
  return <ScrollArea style={{ height, ...style }} {...props} />;
}
