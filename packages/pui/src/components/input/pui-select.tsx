import * as React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "pui/ui/select";
import { cn } from "pui/lib/utils";
import { PuiField, type PuiFieldProps } from "./pui-field";
import type { PuiOption } from "./pui-option";

type PuiSelectProps = Omit<React.ComponentProps<typeof Select>, "children"> &
  Pick<PuiFieldProps, "label" | "description" | "error"> & {
    options: PuiOption[];
    placeholder?: string;
    id?: string;
    className?: string;
  };

export function PuiSelect({
  options,
  placeholder,
  label,
  description,
  error,
  id,
  className,
  ...props
}: PuiSelectProps) {
  const autoId = React.useId();
  const triggerId = id ?? autoId;
  return (
    <PuiField label={label} description={description} error={error} htmlFor={triggerId} className={className}>
      <Select {...props}>
        <SelectTrigger id={triggerId} aria-invalid={error ? true : undefined} className={cn("w-full")}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
              {option.icon}
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </PuiField>
  );
}
