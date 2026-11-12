import { cloneElement, isValidElement, type ReactNode } from "react";
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
  const errorId = `${htmlFor}-error`;
  const control = isValidElement<{
    "aria-describedby"?: string;
    "aria-invalid"?: boolean;
    "aria-required"?: boolean;
  }>(children)
    ? cloneElement(children, {
        "aria-invalid": Boolean(error),
        "aria-describedby": error ? errorId : undefined,
        "aria-required": required || undefined,
      })
    : children;
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <label className="text-sm leading-5 font-medium" htmlFor={htmlFor}>
        {label}
        {required ? (
          <span aria-hidden="true" className="text-error ml-1">
            *
          </span>
        ) : null}
      </label>
      {control}
      <div className="min-h-4">
        {error ? (
          <p id={errorId} role="alert" className="text-error text-xs leading-4">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
