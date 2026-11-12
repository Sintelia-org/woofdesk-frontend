import type { TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "textarea textarea-bordered focus:border-primary w-full resize-none bg-white focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}
