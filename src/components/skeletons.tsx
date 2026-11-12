import { TableLoading } from "@/components/table";
import { cn } from "@/lib/cn";

const gridPageClassName =
  "grid-page flex h-full min-h-0 min-w-0 flex-col gap-4 overflow-hidden p-4 sm:p-6 lg:p-8";
const scrollPageClassName =
  "flex h-full min-h-0 flex-col gap-6 overflow-y-auto p-4 sm:p-6 lg:p-8";

type RouteSkeletonConfig = {
  body: "table" | "calendar" | "cards" | "dashboard";
  filters?: number;
  button?: boolean;
  toolbar?: boolean;
  cards?: { count: number; className: string };
};

// One entry per view in src/app/[org]/(general); keep in sync when a view's
// layout changes so the skeleton matches what replaces it.
const routeSkeletons: Record<string, RouteSkeletonConfig> = {
  dashboard: { body: "dashboard", button: true },
  agenda: {
    body: "cards",
    toolbar: true,
    filters: 2,
    cards: { count: 4, className: "xl:grid-cols-2" },
  },
  turnos: { body: "calendar", toolbar: true, filters: 2 },
  mascotas: { body: "table", toolbar: true, filters: 1, button: true },
  clientes: { body: "table", toolbar: true, filters: 1, button: true },
  servicios: {
    body: "cards",
    toolbar: true,
    button: true,
    cards: { count: 6, className: "sm:grid-cols-2 xl:grid-cols-3" },
  },
  razas: { body: "table", toolbar: true },
  personal: { body: "table", toolbar: true, filters: 1, button: true },
  usuarios: { body: "table", toolbar: true, filters: 1, button: true },
  roles: {
    body: "cards",
    toolbar: true,
    cards: { count: 3, className: "lg:grid-cols-3" },
  },
  cuenta: { body: "cards", cards: { count: 2, className: "lg:grid-cols-2" } },
  ayuda: { body: "cards", cards: { count: 4, className: "lg:grid-cols-2" } },
};
const fallbackSkeleton: RouteSkeletonConfig = {
  body: "cards",
  cards: { count: 4, className: "lg:grid-cols-2" },
};

function Bone({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("bg-base-300/70 block animate-pulse rounded-md", className)}
    />
  );
}

export function HeaderSkeleton({
  button = false,
  subtitle = false,
}: {
  button?: boolean;
  subtitle?: boolean;
}) {
  return (
    <div className="flex shrink-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <Bone className="bg-primary/15 size-11 shrink-0 rounded-xl" />
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <Bone className="h-8 w-44 rounded-lg" />
            <Bone className="h-6 w-9 rounded-full" />
          </div>
          {subtitle ? <Bone className="h-3.5 w-52 rounded-full" /> : null}
        </div>
      </div>
      {button ? <Bone className="rounded-field h-8 w-36" /> : null}
    </div>
  );
}

export function ToolbarSkeleton({ filters = 0 }: { filters?: number }) {
  return (
    <div className="border-base-300 bg-base-100 rounded-box flex shrink-0 flex-wrap items-center gap-3 border p-3">
      <Bone className="h-10 w-full sm:max-w-sm" />
      {Array.from({ length: filters }, (_, index) => (
        <Bone key={index} className="h-8 w-40" />
      ))}
    </div>
  );
}

export function CardsSkeleton({
  count,
  className,
}: {
  count: number;
  className?: string;
}) {
  return (
    <div className={cn("grid content-start gap-4", className)}>
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="bg-base-100 border-base-300 rounded-box flex flex-col gap-3 border p-5"
        >
          <Bone className="bg-primary/15 size-9 rounded-xl" />
          <Bone className="h-5 w-2/5" />
          <Bone className="h-3 w-4/5 rounded-full" />
          <Bone className="h-3 w-3/5 rounded-full" />
        </div>
      ))}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="bg-base-100 border-base-300 rounded-box flex flex-col gap-3 border p-4.5"
          >
            <div className="flex items-center justify-between">
              <Bone className="h-3.5 w-28 rounded-full" />
              <Bone className="rounded-field size-9" />
            </div>
            <Bone className="h-9 w-28" />
            <Bone className="h-3.5 w-36 rounded-full" />
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-3.5">
        <Bone className="h-6 w-44" />
        <CardsSkeleton count={4} className="sm:grid-cols-2 xl:grid-cols-4" />
      </div>
      <ChartSkeleton />
    </>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-base-100 border-base-300 rounded-box flex h-96 flex-col gap-4 border p-5">
      <Bone className="h-6 w-56" />
      <Bone className="min-h-0 w-full flex-1" />
    </div>
  );
}

export function RouteSkeleton({ pathname }: { pathname: string }) {
  // Authenticated paths are /{org}/{view}/...
  const view = pathname.split("/")[2] ?? "";
  const config = routeSkeletons[view] ?? fallbackSkeleton;
  const scrolls = config.body === "dashboard" || !config.toolbar;
  return (
    <div
      role="status"
      aria-busy="true"
      className={scrolls ? scrollPageClassName : gridPageClassName}
    >
      <span className="sr-only">Cargando vista…</span>
      <HeaderSkeleton
        button={config.button}
        subtitle={config.body === "dashboard"}
      />
      {config.toolbar ? <ToolbarSkeleton filters={config.filters} /> : null}
      {config.body === "dashboard" ? (
        <DashboardSkeleton />
      ) : config.body === "table" ? (
        <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
          <TableLoading />
        </div>
      ) : config.body === "calendar" ? (
        <Bone className="rounded-box min-h-0 flex-1" />
      ) : (
        <CardsSkeleton
          count={config.cards?.count ?? 4}
          className={cn(
            config.toolbar && "min-h-0 flex-1 overflow-hidden",
            config.cards?.className,
          )}
        />
      )}
    </div>
  );
}
