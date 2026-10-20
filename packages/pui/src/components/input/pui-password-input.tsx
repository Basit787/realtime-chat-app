import * as React from "react";
import { PasswordInput } from "./password-input";
import { PuiField, type PuiFieldProps } from "./pui-field";

type PuiPasswordInputProps = React.ComponentProps<typeof PasswordInput> &
  Pick<PuiFieldProps, "label" | "description" | "error">;

export function PuiPasswordInput({ label, description, error, id, className, ...props }: PuiPasswordInputProps) {
  const autoId = React.useId();
  const inputId = id ?? autoId;
  return (
    <PuiField label={label} description={description} error={error} htmlFor={inputId} className={className}>
      <PasswordInput id={inputId} aria-invalid={error ? true : undefined} {...props} />
    </PuiField>
  );
}
