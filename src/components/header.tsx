import { PlusIcon, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { AppearHeader } from "@/components/appear";
import { Button } from "@/components/shadcn/button";
import { initials } from "@/features/shared/format";
// Name cell for people tables (personal, usuarios): initials avatar + name.
export function PersonName({ name }: { name: string }) {
  if (!name) return "—";
  return (
    <span className="flex min-w-0 items-center gap-3">
      <span
        aria-hidden="true"
        className="bg-primary/15 text-primary-ink flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
      >
        {initials(name)}
      </span>
      <span className="truncate font-medium">{name}</span>
    </span>
  );
}

// Title block for a section inside a view that already has a GeneralHeader,
// such as each settings tab: an h2, so the page keeps a single h1.
export function SectionHeader({
  title,
  count,
  description,
  button,
}: {
  title: string;
  count?: number;
  description?: string;
  button?: { text: string; onClick: () => void };
}) {
  return (
    <AppearHeader className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <div className="flex items-end gap-3">
          <h2 className="text-xl font-bold tracking-tight">{title}</h2>
          {count !== undefined ? (
            <span className="bg-secondary/20 text-base-content/70 rounded-full px-2.5 py-0.5 text-xs font-semibold">
              {count}
            </span>
          ) : null}
        </div>
        {description ? (
          <p className="text-base-content/70 mt-1 max-w-2xl text-sm">
            {description}
          </p>
        ) : null}
      </div>
      {button ? (
        <Button size="sm" onClick={button.onClick}>
          <PlusIcon className="size-4" />
          {button.text}
        </Button>
      ) : null}
    </AppearHeader>
  );
}

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
          <div className="flex items-end gap-3">
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
