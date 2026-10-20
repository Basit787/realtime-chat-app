import * as React from "react";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { Button } from "pui/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "pui/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "pui/ui/popover";
import { cn } from "pui/lib/utils";
import { PuiField, type PuiFieldProps } from "./pui-field";
import type { PuiOption } from "./pui-option";

type PuiComboboxProps = Pick<PuiFieldProps, "label" | "description" | "error"> & {
  options: (PuiOption & { label: string })[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
};

// Searchable select (Popover + Command)
export function PuiCombobox({
  options,
  value,
  onValueChange,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  emptyText = "Nothing found.",
  disabled,
  label,
  description,
  error,
  className,
}: PuiComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const buttonId = React.useId();
  const selected = options.find((option) => option.value === value);
  return (
    <PuiField label={label} description={description} error={error} htmlFor={buttonId} className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={buttonId}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            className={cn("w-full justify-between font-normal", !selected && "text-muted-foreground")}
          >
            {selected?.label ?? placeholder}
            <ChevronsUpDownIcon className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    disabled={option.disabled}
                    onSelect={() => {
                      onValueChange?.(option.value === value ? "" : option.value);
                      setOpen(false);
                    }}
                  >
                    {option.icon}
                    {option.label}
                    <CheckIcon className={cn("ml-auto", option.value === value ? "opacity-100" : "opacity-0")} />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </PuiField>
  );
}
