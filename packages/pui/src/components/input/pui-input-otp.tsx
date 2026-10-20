import * as React from "react";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "pui/ui/input-otp";
import { PuiField, type PuiFieldProps } from "./pui-field";

type PuiInputOTPProps = Pick<PuiFieldProps, "label" | "description" | "error"> & {
  // Digits per group, e.g. [3, 3] renders "123-456"
  groups?: number[];
  value?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  className?: string;
};

export function PuiInputOTP({
  groups = [6],
  value,
  onChange,
  onComplete,
  disabled,
  label,
  description,
  error,
  className,
}: PuiInputOTPProps) {
  const length = groups.reduce((sum, size) => sum + size, 0);
  let index = 0;
  return (
    <PuiField label={label} description={description} error={error} className={className}>
      <InputOTP maxLength={length} value={value} onChange={onChange} onComplete={onComplete} disabled={disabled}>
        {groups.map((size, groupIndex) => (
          <React.Fragment key={groupIndex}>
            {groupIndex > 0 && <InputOTPSeparator />}
            <InputOTPGroup>
              {Array.from({ length: size }, () => {
                const slot = index++;
                return <InputOTPSlot key={slot} index={slot} />;
              })}
            </InputOTPGroup>
          </React.Fragment>
        ))}
      </InputOTP>
    </PuiField>
  );
}
