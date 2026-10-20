import type { ReactNode } from "react";

// One choice in a select, radio group, combobox or toggle group
export type PuiOption = {
  value: string;
  label: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
};
