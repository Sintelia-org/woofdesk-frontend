import { PlusIcon, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { AppearHeader } from "@/components/appear";
import { Button } from "@/components/shadcn/button";
export function GeneralHeader({
  title,
  Svg,
  count,
  description,
  subtitle,
  actions,
  button,
}: {
  title: string;
  Svg: LucideIcon;
  count?: number;
  description?: string;
  subtitle?: string;
  actions?: ReactNode;
  button?: { text: string; onClick: () => void };
}) {
  return (
    <AppearHeader className="flex shrink-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="bg-primary/15 text-primary flex size-11 shrink-0 items-center justify-center rounded-xl">
          <Svg className="size-6" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {title}
            </h1>
            {count !== undefined ? (
              <span className="bg-secondary/20 text-base-content/70 rounded-full px-2.5 py-1 text-xs font-semibold">
                {count}
              </span>
            ) : null}
          </div>
          {subtitle ? (
            <p className="text-base-content/70 mt-0.5 text-[13px]">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
      {actions || button ? (
        <div className="flex flex-wrap items-center gap-2.5">
          {actions}
          {button ? (
            <Button size="sm" onClick={button.onClick}>
              <PlusIcon className="size-4" />
              {button.text}
            </Button>
          ) : null}
        </div>
      ) : null}
    </AppearHeader>
  );
}
