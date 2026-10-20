import type { ReactNode } from "react";
import type { ControllerRenderProps, FieldPath, FieldValues, UseControllerProps } from "react-hook-form";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "pui/ui/form";

type PuiFormFieldProps<TValues extends FieldValues, TName extends FieldPath<TValues>> = UseControllerProps<
  TValues,
  TName
> & {
  label?: ReactNode;
  description?: ReactNode;
  className?: string;
  children: (field: ControllerRenderProps<TValues, TName>) => ReactNode;
};

// react-hook-form field with label, description and validation message
export function PuiFormField<TValues extends FieldValues, TName extends FieldPath<TValues>>({
  label,
  description,
  className,
  children,
  ...controller
}: PuiFormFieldProps<TValues, TName>) {
  return (
    <FormField
      {...controller}
      render={({ field }) => (
        <FormItem className={className}>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>{children(field)}</FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
