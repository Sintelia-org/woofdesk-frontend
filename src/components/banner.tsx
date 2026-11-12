"use client";

import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  InfoIcon,
  XIcon,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

const bannerVariants = {
  accent: {
    className: "border-accent/40 bg-accent/15 text-accent-content",
    icon: InfoIcon,
  },
  error: {
    className: "border-error/35 bg-error/10 text-error",
    icon: AlertTriangleIcon,
  },
  info: {
    className: "border-info/35 bg-info/10 text-base-content",
    icon: InfoIcon,
  },
  neutral: {
    className: "border-secondary/40 bg-base-100 text-base-content",
    icon: InfoIcon,
  },
  success: {
    className: "border-success/35 bg-success/10 text-base-content",
    icon: CheckCircle2Icon,
  },
  warning: {
    className: "border-warning/45 bg-warning/10 text-base-content",
    icon: AlertTriangleIcon,
  },
} satisfies Record<string, { className: string; icon: LucideIcon }>;

export type BannerVariant = keyof typeof bannerVariants;

export function Banner({
  action,
  children,
  className,
  onDismiss,
  title,
  variant = "neutral",
}: {
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  onDismiss?: () => void;
  title?: ReactNode;
  variant?: BannerVariant;
}) {
  const { className: variantClassName, icon: Icon } = bannerVariants[variant];

  return (
    <aside
      className={cn(
        "relative flex w-full items-start justify-center gap-2.5 border-b px-10 py-3 text-sm sm:items-center sm:px-12",
        variantClassName,
        className,
      )}
      role={variant === "error" || variant === "warning" ? "alert" : "status"}
    >
      <Icon aria-hidden="true" className="mt-0.5 size-4 min-w-4 sm:mt-0" />
      <div className="flex min-w-0 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-2">
        {title ? <strong className="font-semibold">{title}</strong> : null}
        {title ? (
          <span aria-hidden="true" className="hidden sm:inline">
            •
          </span>
        ) : null}
        <div>{children}</div>
        {action ? <div className="shrink-0 font-semibold">{action}</div> : null}
      </div>
      {onDismiss ? (
        <button
          aria-label="Cerrar aviso"
          className="absolute top-2.5 right-3 flex size-7 cursor-pointer items-center justify-center rounded-sm opacity-65 hover:bg-black/5 hover:opacity-100 sm:top-1/2 sm:-translate-y-1/2"
          onClick={onDismiss}
          type="button"
        >
          <XIcon className="size-4" />
        </button>
      ) : null}
    </aside>
  );
}
