import * as React from "react";
import { Field, FieldContent, FieldDescription, FieldLabel } from "pui/ui/field";
import { Switch } from "pui/ui/switch";

type PuiSwitchProps = React.ComponentProps<typeof Switch> & { label?: React.ReactNode; description?: React.ReactNode };

export function PuiSwitch({ label, description, id, className, ...props }: PuiSwitchProps) {
  const autoId = React.useId();
  const switchId = id ?? autoId;
  return (
    <Field orientation="horizontal" className={className}>
      {(label || description) && (
        <FieldContent>
          {label && <FieldLabel htmlFor={switchId}>{label}</FieldLabel>}
          {description && <FieldDescription>{description}</FieldDescription>}
        </FieldContent>
      )}
      <Switch id={switchId} {...props} />
    </Field>
  );
}
