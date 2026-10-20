import * as React from "react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "pui/ui/input-group";
import { PuiField, type PuiFieldProps } from "./pui-field";

type PuiInputGroupProps = React.ComponentProps<typeof InputGroupInput> &
  Pick<PuiFieldProps, "label" | "description" | "error"> & {
    // Icon, text or button shown before / after the input
    start?: React.ReactNode;
    end?: React.ReactNode;
  };

export function PuiInputGroup({ start, end, label, description, error, id, className, ...props }: PuiInputGroupProps) {
  const autoId = React.useId();
  const inputId = id ?? autoId;
  return (
    <PuiField label={label} description={description} error={error} htmlFor={inputId} className={className}>
      <InputGroup>
        <InputGroupInput id={inputId} aria-invalid={error ? true : undefined} {...props} />
        {start && <InputGroupAddon>{start}</InputGroupAddon>}
        {end && <InputGroupAddon align="inline-end">{end}</InputGroupAddon>}
      </InputGroup>
    </PuiField>
  );
}
