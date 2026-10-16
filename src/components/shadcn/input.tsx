import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "input input-bordered bg-base-100 focus:border-primary w-full focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}
