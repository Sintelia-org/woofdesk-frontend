"use client";
import { useQueries, useQuery } from "@tanstack/react-query";
import {
  addDays,
  addMinutes,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  startOfMonth,
} from "date-fns";
import { es } from "date-fns/locale";
import {
  ArrowRightIcon,
  BellIcon,
  CalendarDaysIcon,
  ClockIcon,
  LayoutDashboardIcon,
  PawPrintIcon,
  ScissorsIcon,
  ShoppingBagIcon,
  WalletIcon,
  type LucideIcon,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useState, type ReactNode } from "react";
import {
  AppearArticle,
  AppearGroup,
  AppearItem,
  AppearList,
} from "@/components/appear";
import { ErrorInformer } from "@/components/error";
import { GeneralHeader } from "@/components/header";
import { NavigationLink as Link } from "@/components/layout/route-navigation";
import { CreateAppointmentModal } from "@/components/modals/appointments";
import { SelectInput } from "@/components/select-input";
import { CardsSkeleton, ChartSkeleton } from "@/components/skeletons";
import { calendarDay } from "@/features/appointments/calendar";
import { getAppointments } from "@/features/appointments/requests";
import type { AppointmentSummary } from "@/features/appointments/schemas";
import { getPet } from "@/features/pets/requests";
import { useSession } from "@/features/session/session.client";
import { localDate } from "@/features/shared/format";
import { cn } from "@/lib/cn";
import { getErrorMessage } from "@/lib/query";
import type { ServerError } from "@/lib/types";
import type { DailyIncome } from "./daily-income-chart";
import { dashboardExampleData } from "./example-data";
import { capitalize, wholeMoney } from "./format";

// Recharts is only needed by this chart; load it in its own chunk.
const DailyIncomeChart = dynamic(
  () =>
    import("./daily-income-chart").then((module) => module.DailyIncomeChart),
  { loading: () => <ChartSkeleton /> },
);

const UPCOMING_LIMIT = 4;
const UPCOMING_DAYS = 30;
const hoursFormat = new Intl.NumberFormat("es-AR", {
  maximumFractionDigits: 1,
});

const metricTones = {
  primary: "bg-primary/15 text-primary",
  success: "bg-success/15 text-success",
  warning: "bg-secondary/25 text-warning",
  info: "bg-info/15 text-info",
} as const;

function monthOptions(today: Date) {
  return Array.from({ length: 14 }, (_, index) => {
    const month = addMonths(startOfMonth(today), 2 - index);
    return {
      value: format(month, "yyyy-MM"),
      label: capitalize(format(month, "LLLL yyyy", { locale: es })),
      icon: (
        <CalendarDaysIcon
          aria-hidden="true"
          className="text-base-content/70 size-4 shrink-0"
        />
      ),
    };
  });
}

function MetricCard({
  label,
  value,
  detail,
  Icon,
  tone,
  loading,
}: {
  label: string;
  value: string;
  detail: ReactNode;
  Icon: LucideIcon;
  tone: keyof typeof metricTones;
  loading: boolean;
}) {
  return (
    <AppearArticle className="bg-base-100 border-base-300 rounded-box flex flex-col gap-3 border p-4.5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-base-content/70 text-[13px]">{label}</p>
        <span
          className={cn(
            "rounded-field flex size-9 shrink-0 items-center justify-center",
            metricTones[tone],
          )}
        >
          <Icon aria-hidden="true" className="size-4.5" />
        </span>
      </div>
      {loading ? (
        <>
          <span className="bg-base-300 block h-9 w-28 animate-pulse rounded-md" />
          <span className="bg-base-300/70 block h-3.5 w-36 animate-pulse rounded-full" />
        </>
      ) : (
        <>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          <p className="text-base-content/70 [&_strong]:text-base-content text-xs">
            {detail}
          </p>
        </>
      )}
    </AppearArticle>
  );
}

function UpcomingAppointmentCard({
  appointment,
  breed,
  now,
}: {
  appointment: AppointmentSummary;
  breed?: string | null;
  now: Date;
}) {
  const start = new Date(appointment.datetime);
  const end = addMinutes(
    start,
    dashboardExampleData.appointmentDurationMinutes,
  );
  const isToday = isSameDay(start, now);
  const isTomorrow = isSameDay(start, addDays(now, 1));
  const shortDay = format(start, "EEE d MMM", { locale: es });
  const dayLabel = isToday
    ? `Hoy · ${shortDay}`
    : isTomorrow
      ? `Mañana · ${shortDay}`
      : capitalize(shortDay);

  return (
    <AppearArticle className="bg-base-100 border-base-300 rounded-box flex flex-col gap-4 border p-4.5">
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-semibold",
            isToday
              ? "bg-primary/20 text-primary-ink"
              : "bg-secondary/25 text-base-content",
          )}
        >
          {dayLabel}
        </span>
        <span className="bg-info/15 text-info-ink rounded-full px-2 py-0.5 text-[11px] font-semibold">
          Agendado
        </span>
      </div>

      <div className="bg-base-200 rounded-field flex items-center justify-between gap-2.5 px-3 py-2.5">
        <div>
          <p className="font-mono-ui text-base-content/70 text-[10px] tracking-wider">
            ENTRADA
          </p>
          <p className="font-mono-ui mt-0.5 text-xl font-semibold">
            {format(start, "HH:mm")}
          </p>
        </div>
        <ArrowRightIcon
          aria-hidden="true"
          className="text-base-content/50 size-4 shrink-0"
        />
        <div className="text-right">
          <p className="font-mono-ui text-base-content/70 text-[10px] tracking-wider">
            SALIDA
          </p>
          <p className="font-mono-ui mt-0.5 text-xl font-semibold">
            {format(end, "HH:mm")}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="bg-secondary/25 text-base-content/70 flex size-10 shrink-0 items-center justify-center rounded-full">
          <PawPrintIcon aria-hidden="true" className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-base font-bold">{appointment.petName}</p>
          <p className="text-base-content/70 mt-0.5 truncate text-xs">
            {breed ? `${breed} · ` : ""}
            {appointment.clientName}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="font-mono-ui text-base-content/70 text-[10px] tracking-wider">
          SERVICIOS
        </p>
        <ul className="flex flex-wrap gap-1.5">
          {appointment.services.map((service) => (
            <li
              key={service}
              className="border-base-300 rounded-full border bg-white px-2.5 py-1 text-xs"
            >
              {service}
            </li>
          ))}
        </ul>
      </div>

      <div className="border-base-300 mt-auto flex flex-col gap-3 border-t pt-3.5">
        <div className="flex items-baseline justify-between">
          <span className="text-base-content/70 text-xs">Precio</span>
          <span className="font-mono-ui text-xl font-bold">
            {wholeMoney(appointment.netPrice)}
          </span>
        </div>
        {/* No reminder endpoint exists yet, so the action stays disabled. */}
        <button
          type="button"
          disabled
          className="bg-neutral text-neutral-content flex h-11 w-full cursor-not-allowed items-center justify-center gap-2 rounded-sm text-[13px] font-semibold opacity-60"
        >
          <BellIcon aria-hidden="true" className="size-4" />
          Enviar recordatorio
          <span className="bg-neutral-content/15 rounded-full px-2 py-0.5 text-[10px] font-semibold">
            Próximamente
          </span>
        </button>
      </div>
    </AppearArticle>
  );
}

export function DashboardPage() {
  const session = useSession();
  const orgId = session.data?.orgId;
  const canWrite =
    session.data?.role === "ADMIN" || session.data?.role === "RECEPTIONIST";
  const now = new Date();
  const today = localDate(now);
  const [month, setMonth] = useState(() => today.slice(0, 7));
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const monthStart = new Date(month + "-01T12:00:00");
  const monthEnd = endOfMonth(monthStart);
  // API boundaries are organization-local; padding covers device/organization
  // timezone differences and results are filtered by device-local day.
  const monthRange = {
    from: calendarDay(addDays(monthStart, -2)),
    to: calendarDay(addDays(monthEnd, 2)),
  };
  const upcomingRange = {
    from: calendarDay(addDays(now, -1)),
    to: calendarDay(addDays(now, UPCOMING_DAYS)),
  };

  const monthQuery = useQuery<
    Awaited<ReturnType<typeof getAppointments>>,
    ServerError
  >({
    queryKey: [
      "appointments",
      orgId,
      "dashboard-month",
      monthRange.from,
      monthRange.to,
    ],
    queryFn: () => getAppointments(monthRange),
    enabled: !!orgId,
    retry: false,
    refetchOnWindowFocus: false,
  });
  const upcomingQuery = useQuery<
    Awaited<ReturnType<typeof getAppointments>>,
    ServerError
  >({
    queryKey: [
      "appointments",
      orgId,
      "dashboard-upcoming",
      upcomingRange.from,
      upcomingRange.to,
    ],
    queryFn: () => getAppointments({ ...upcomingRange, state: "SCHEDULED" }),
    enabled: !!orgId,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const upcoming = (upcomingQuery.data ?? [])
    .filter((item) => new Date(item.datetime) >= now)
    .sort(
      (left, right) =>
        new Date(left.datetime).getTime() - new Date(right.datetime).getTime(),
    )
    .slice(0, UPCOMING_LIMIT);
  // Breed is not part of the appointment summary; reuse the pet detail query.
  const petQueries = useQueries({
    queries: upcoming.map((item) => ({
      queryKey: ["pets", orgId, "detail", item.petId],
      queryFn: () => getPet(item.petId),
      enabled: !!orgId,
      retry: false,
      refetchOnWindowFocus: false,
    })),
  });

  const monthRecords = (monthQuery.data ?? []).filter((item) =>
    localDate(new Date(item.datetime)).startsWith(month),
  );
  const completed = monthRecords.filter((item) => item.state === "COMPLETED");
  const scheduledCount = monthRecords.length - completed.length;
  const servicesIncome = completed.reduce(
    (sum, item) => sum + item.netPrice,
    0,
  );
  const workDays = new Set(
    completed.map((item) => localDate(new Date(item.datetime))),
  ).size;
  const recordsByDay = new Map<string, AppointmentSummary[]>();
  for (const item of monthRecords) {
    const date = localDate(new Date(item.datetime));
    recordsByDay.set(date, [...(recordsByDay.get(date) ?? []), item]);
  }
  const daily: DailyIncome[] = eachDayOfInterval({
    start: startOfMonth(monthStart),
    end: monthEnd,
  }).map((day) => {
    const date = calendarDay(day);
    const items = recordsByDay.get(date) ?? [];
    const done = items.filter((item) => item.state === "COMPLETED");
    return {
      date,
      day: day.getDate(),
      income: done.reduce((sum, item) => sum + item.netPrice, 0),
      completed: done.length,
      scheduled: items.length - done.length,
      isToday: date === today,
    };
  });
  const todayIndex = daily.findIndex((item) => item.isToday);
  const lastIncomeIndex = daily.findLastIndex((item) => item.income > 0);
  const defaultIndex =
    todayIndex >= 0 ? todayIndex : Math.max(lastIncomeIndex, 0);
  const monthLabel = capitalize(
    format(monthStart, "LLLL yyyy", { locale: es }),
  );
  const { monthlySales, monthlySalesCount, monthlyWorkedHours } =
    dashboardExampleData;

  return (
    <AppearGroup className="flex h-full min-h-0 flex-col gap-6 overflow-y-auto p-4 sm:p-6 lg:p-8">
      <GeneralHeader
        title="Resumen"
        Svg={LayoutDashboardIcon}
        subtitle={capitalize(
          format(now, "EEEE d 'de' MMMM 'de' yyyy", { locale: es }),
        )}
        actions={
          <SelectInput
            aria-label="Mes del resumen"
            entityName="meses"
            className="w-48"
            value={month}
            onValueChange={setMonth}
            options={monthOptions(now)}
          />
        }
        button={
          canWrite
            ? { text: "Nuevo turno", onClick: () => setIsCreateModalOpen(true) }
            : undefined
        }
      />

      <section
        aria-label="Totales del mes"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {monthQuery.isError ? (
          <ErrorInformer
            className="sm:col-span-2 xl:col-span-4"
            message={getErrorMessage(monthQuery.error)}
            retry={() => {
              void monthQuery.refetch();
            }}
          />
        ) : (
          <>
            <MetricCard
              label="Turnos del mes"
              value={String(completed.length)}
              detail={
                <>
                  completados · <strong>{scheduledCount}</strong> programados
                </>
              }
              Icon={ScissorsIcon}
              tone="primary"
              loading={monthQuery.isPending}
            />
            <MetricCard
              label="Ganancia del mes"
              value={wholeMoney(servicesIncome + monthlySales)}
              detail={
                <>
                  Turnos <strong>{wholeMoney(servicesIncome)}</strong> + ventas
                </>
              }
              Icon={WalletIcon}
              tone="success"
              loading={monthQuery.isPending}
            />
            <MetricCard
              label="Ganancia por ventas"
              value={wholeMoney(monthlySales)}
              detail={
                <>
                  <strong>{monthlySalesCount}</strong> ventas en el petshop
                </>
              }
              Icon={ShoppingBagIcon}
              tone="warning"
              loading={monthQuery.isPending}
            />
            <MetricCard
              label="Horas trabajadas"
              value={`${hoursFormat.format(monthlyWorkedHours)} h`}
              detail={
                <>
                  en <strong>{workDays}</strong> días con turnos
                </>
              }
              Icon={ClockIcon}
              tone="info"
              loading={monthQuery.isPending}
            />
          </>
        )}
      </section>

      <section
        aria-labelledby="upcoming-title"
        className="flex flex-col gap-3.5"
      >
        <AppearItem className="flex flex-wrap items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-2.5">
            <h2 id="upcoming-title" className="text-lg font-bold">
              Próximos turnos
            </h2>
            <span className="text-base-content/70 text-xs">
              Los {UPCOMING_LIMIT} más cercanos
            </span>
          </div>
          <Link
            href={`/${orgId}/agenda`}
            className="text-primary-ink flex items-center gap-1.5 text-[13px] font-semibold hover:underline"
          >
            Ver agenda
            <ArrowRightIcon aria-hidden="true" className="size-3.5" />
          </Link>
        </AppearItem>
        {upcomingQuery.isPending ? (
          <CardsSkeleton
            count={UPCOMING_LIMIT}
            className="sm:grid-cols-2 xl:grid-cols-4"
          />
        ) : upcomingQuery.isError ? (
          <ErrorInformer
            message={getErrorMessage(upcomingQuery.error)}
            retry={() => {
              void upcomingQuery.refetch();
            }}
          />
        ) : upcoming.length ? (
          <AppearList className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {upcoming.map((item, index) => (
              <UpcomingAppointmentCard
                key={item.id}
                appointment={item}
                breed={petQueries[index]?.data?.breedName}
                now={now}
              />
            ))}
          </AppearList>
        ) : (
          <div className="bg-base-100 border-base-300 rounded-box border p-8 text-center">
            <p className="text-base-content/70 text-sm">
              No hay turnos agendados para los próximos {UPCOMING_DAYS} días.
            </p>
          </div>
        )}
      </section>

      <AppearItem>
        {monthQuery.isPending ? (
          <ChartSkeleton />
        ) : monthQuery.isSuccess ? (
          <DailyIncomeChart
            key={month}
            data={daily}
            monthLabel={monthLabel}
            defaultIndex={defaultIndex}
          />
        ) : null}
      </AppearItem>

      {isCreateModalOpen ? (
        <CreateAppointmentModal
          isOpen
          onClose={() => setIsCreateModalOpen(false)}
        />
      ) : null}
    </AppearGroup>
  );
}
