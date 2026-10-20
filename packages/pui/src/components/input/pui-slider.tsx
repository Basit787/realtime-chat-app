import * as React from "react";
import { Slider } from "pui/ui/slider";
import { PuiField, type PuiFieldProps } from "./pui-field";

type PuiSliderProps = React.ComponentProps<typeof Slider> &
  Pick<PuiFieldProps, "label" | "description"> & { showValue?: boolean };

export function PuiSlider({ label, description, showValue, className, ...props }: PuiSliderProps) {
  const current = props.value ?? props.defaultValue ?? [];
  return (
    <PuiField
      label={
        label && (
          <span className="flex w-full justify-between">
            {label}
            {showValue && <span className="text-muted-foreground">{current.join(" – ")}</span>}
          </span>
        )
      }
      description={description}
      className={className}
    >
      <Slider {...props} />
    </PuiField>
  );
}
