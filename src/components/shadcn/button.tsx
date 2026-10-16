import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "btn inline-flex items-center justify-center gap-2 font-medium",
  {
    variants: {
      variant: {
        default: "btn-primary",
        secondary: "btn-secondary",
        neutral: "btn-neutral",
        outline: "btn-outline",
        ghost: "btn-ghost",
        danger: "btn-error",
      },
      size: {
        sm: "btn-sm",
        md: "",
        lg: "btn-lg",
        icon: "btn-square",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean;
  };

export function Button({
  children,
  className,
  disabled,
  loading = false,
  size,
  variant,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ size, variant }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <span className="loading loading-spinner loading-sm" /> : null}
      {children}
    </button>
  );
}
