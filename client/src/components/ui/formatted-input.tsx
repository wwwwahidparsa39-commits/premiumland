import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export interface FormattedInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  format?: (val: string) => string;
}

const FormattedInput = React.forwardRef<HTMLInputElement, FormattedInputProps>(
  ({ className, type, onChange, format, ...props }, ref) => {
    return (
      <Input
        type={type}
        className={cn(
          "bg-slate-900/50 border-slate-800 focus:border-cyan-500 focus:ring-cyan-500/20 text-right",
          className
        )}
        onChange={onChange}
        ref={ref}
        {...props}
      />
    );
  }
);
FormattedInput.displayName = "FormattedInput";

export { FormattedInput };
