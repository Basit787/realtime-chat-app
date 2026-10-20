import type { ReactNode } from "react";
import { Field, FieldDescription, FieldError, FieldLabel } from "pui/ui/field";

export type PuiFieldProps = {
  label?: ReactNode;
  description?: ReactNode;
  error?: string;
  htmlFor?: string;
  orientation?: "vertical" | "horizontal";
  className?: string;
  children: ReactNode;
};

// Label, control, description and error laid out the shadcn way
export function PuiField({ label, description, error, htmlFor, orientation, className, children }: PuiFieldProps) {
  return (
    <Field orientation={orientation} data-invalid={error ? true : undefined} className={className}>
      {label && <FieldLabel htmlFor={htmlFor}>{label}</FieldLabel>}
      {children}
      {description && <FieldDescription>{description}</FieldDescription>}
      {error && <FieldError>{error}</FieldError>}
    </Field>
  );
}
