import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type FieldProps = {
  children: ReactNode;
  className?: string;
  error?: string;
  htmlFor: string;
  label: string;
  required?: boolean;
};

export function Field({
  children,
  className,
  error,
  htmlFor,
  label,
  required = false,
}: FieldProps) {
  return (
    <div className={cn("fieldset", className)}>
      <label className="fieldset-legend" htmlFor={htmlFor}>
        {label}
        {required ? <span className="text-error ml-1">*</span> : null}
      </label>
      {children}
      {error ? <p className="text-error mt-1 text-sm">{error}</p> : null}
    </div>
  );
}
