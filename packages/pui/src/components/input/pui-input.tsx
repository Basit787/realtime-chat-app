import * as React from "react";
import { Input } from "pui/ui/input";
import { PuiField, type PuiFieldProps } from "./pui-field";

type PuiInputProps = React.ComponentProps<typeof Input> & Pick<PuiFieldProps, "label" | "description" | "error">;

export function PuiInput({ label, description, error, id, className, ...props }: PuiInputProps) {
  const autoId = React.useId();
  const inputId = id ?? autoId;
  return (
    <PuiField label={label} description={description} error={error} htmlFor={inputId} className={className}>
      <Input id={inputId} aria-invalid={error ? true : undefined} {...props} />
    </PuiField>
  );
}
