import * as React from "react";
import { Field, FieldContent, FieldDescription, FieldLabel } from "pui/ui/field";
import { RadioGroup, RadioGroupItem } from "pui/ui/radio-group";
import { PuiField, type PuiFieldProps } from "./pui-field";
import type { PuiOption } from "./pui-option";

type PuiRadioGroupProps = Omit<React.ComponentProps<typeof RadioGroup>, "children"> &
  Pick<PuiFieldProps, "label" | "description" | "error"> & { options: PuiOption[] };

export function PuiRadioGroup({ options, label, description, error, className, ...props }: PuiRadioGroupProps) {
  const groupId = React.useId();
  return (
    <PuiField label={label} description={description} error={error} className={className}>
      <RadioGroup {...props}>
        {options.map((option) => {
          const itemId = `${groupId}-${option.value}`;
          return (
            <Field key={option.value} orientation="horizontal">
              <RadioGroupItem id={itemId} value={option.value} disabled={option.disabled} />
              <FieldContent>
                <FieldLabel htmlFor={itemId}>{option.label}</FieldLabel>
                {option.description && <FieldDescription>{option.description}</FieldDescription>}
              </FieldContent>
            </Field>
          );
        })}
      </RadioGroup>
    </PuiField>
  );
}
