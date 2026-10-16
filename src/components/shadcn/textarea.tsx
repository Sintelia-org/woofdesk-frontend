import type { TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "textarea textarea-bordered bg-base-100 focus:border-primary w-full focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}
