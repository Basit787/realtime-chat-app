import * as React from "react";
import { Checkbox } from "pui/ui/checkbox";
import { Field, FieldContent, FieldDescription, FieldLabel } from "pui/ui/field";

type PuiCheckboxProps = React.ComponentProps<typeof Checkbox> & {
  label?: React.ReactNode;
  description?: React.ReactNode;
};

export function PuiCheckbox({ label, description, id, className, ...props }: PuiCheckboxProps) {
  const autoId = React.useId();
  const checkboxId = id ?? autoId;
  return (
    <Field orientation="horizontal" className={className}>
      <Checkbox id={checkboxId} {...props} />
      {(label || description) && (
        <FieldContent>
          {label && <FieldLabel htmlFor={checkboxId}>{label}</FieldLabel>}
          {description && <FieldDescription>{description}</FieldDescription>}
        </FieldContent>
      )}
    </Field>
  );
}
