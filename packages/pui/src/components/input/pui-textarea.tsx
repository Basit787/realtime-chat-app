import * as React from "react";
import { Textarea } from "pui/ui/textarea";
import { PuiField, type PuiFieldProps } from "./pui-field";

type PuiTextareaProps = React.ComponentProps<typeof Textarea> & Pick<PuiFieldProps, "label" | "description" | "error">;

export function PuiTextarea({ label, description, error, id, className, ...props }: PuiTextareaProps) {
  const autoId = React.useId();
  const inputId = id ?? autoId;
  return (
    <PuiField label={label} description={description} error={error} htmlFor={inputId} className={className}>
      <Textarea id={inputId} aria-invalid={error ? true : undefined} {...props} />
    </PuiField>
  );
}
