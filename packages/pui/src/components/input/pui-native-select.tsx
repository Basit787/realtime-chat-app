import * as React from "react";
import { NativeSelect, NativeSelectOption } from "pui/ui/native-select";
import { PuiField, type PuiFieldProps } from "./pui-field";

type PuiNativeSelectProps = Omit<React.ComponentProps<typeof NativeSelect>, "children"> &
  Pick<PuiFieldProps, "label" | "description" | "error"> & {
    options: { value: string; label: string; disabled?: boolean }[];
    placeholder?: string;
  };

export function PuiNativeSelect({
  options,
  placeholder,
  label,
  description,
  error,
  id,
  className,
  ...props
}: PuiNativeSelectProps) {
  const autoId = React.useId();
  const selectId = id ?? autoId;
  return (
    <PuiField label={label} description={description} error={error} htmlFor={selectId} className={className}>
      <NativeSelect id={selectId} aria-invalid={error ? true : undefined} {...props}>
        {placeholder && <NativeSelectOption value="">{placeholder}</NativeSelectOption>}
        {options.map((option) => (
          <NativeSelectOption key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </PuiField>
  );
}
