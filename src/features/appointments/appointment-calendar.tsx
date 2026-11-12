"use client";

import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  pointerWithin,
  rectIntersection,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type CollisionDetection,
  type KeyboardCoordinateGetter,
} from "@dnd-kit/core";
import { format, getWeek, isSameMonth } from "date-fns";
import { es } from "date-fns/locale";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  GripVerticalIcon,
  PencilIcon,
  PlusIcon,
  SearchXIcon,
} from "lucide-react";
import { DatePickerPopover } from "@/components/date";
import { SelectInput } from "@/components/select-input";
import { Button } from "@/components/shadcn/button";
import { LoadingSpinner } from "@/components/loading";
import { cn } from "@/lib/cn";
import type { AppointmentSummary } from "./schemas";
import {
  calendarDate,
  calendarDay,
  calendarDays,
  calendarDragSchema,
  calendarRange,
  calendarSlots,
  calendarTargetSchema,
  calendarTime,
  stepCalendar,
  type CalendarState,
  type CalendarTarget,
} from "./calendar";

type CalendarProps = {
  state: CalendarState;
  onStateChange: (state: CalendarState) => void;
  appointments: AppointmentSummary[];
  canWrite: boolean;
  pendingId?: number;
  loading: boolean;
  error?: ReactNode;
  onCreate: (datetime: string) => void;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onMove: (id: number, target: CalendarTarget) => void;
};
type EventProps = Pick<
  CalendarProps,
  "canWrite" | "pendingId" | "onView" | "onEdit"
>;
const collisionDetection: CollisionDetection = (args) =>
  args.pointerCoordinates ? pointerWithin(args) : rectIntersection(args);

const keyboardCoordinates: KeyboardCoordinateGetter = (
  event,
  { context, currentCoordinates },
) => {
  const rect = context.collisionRect;
  if (
    !rect ||
    !["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.code)
  )
    return;
  event.preventDefault();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  const vertical = event.code === "ArrowUp" || event.code === "ArrowDown";
  const positive = event.code === "ArrowDown" || event.code === "ArrowRight";
  const candidates = context.droppableContainers
    .getEnabled()
    .flatMap((container) => {
      const target = context.droppableRects.get(container.id);
      if (!target) return [];
      if (
        x >= target.left &&
        x <= target.right &&
        y >= target.top &&
        y <= target.bottom
      )
        return [];
      const dx = target.left + target.width / 2 - x;
      const dy = target.top + target.height / 2 - y;
      const along = vertical ? dy : dx;
      const across = Math.abs(vertical ? dx : dy);
      return (positive ? along > 4 : along < -4) &&
        across < (vertical ? target.width : target.height) / 2
        ? [{ target, distance: Math.abs(along) + across }]
        : [];
    })
    .sort((a, b) => a.distance - b.distance);
  const next = candidates[0]?.target;
  if (next)
    return {
      x: currentCoordinates.x + next.left + next.width / 2 - x,
      y: currentCoordinates.y + next.top + next.height / 2 - y,
    };
};

function eventColor(appointment: AppointmentSummary) {
  return appointment.state === "COMPLETED"
    ? "border-success/30 bg-success/10"
    : appointment.maintenance
      ? "border-info/30 bg-info/10"
      : "border-primary/35 bg-primary/10";
}
function CalendarEvent({
  appointment,
  canWrite,
  pendingId,
  onView,
  onEdit,
}: EventProps & { appointment: AppointmentSummary }) {
  const writable = canWrite && appointment.state === "SCHEDULED";
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, isDragging } =
    useDraggable({
      id: `appointment-${appointment.id}`,
      data: { appointmentId: appointment.id },
      disabled: !writable || pendingId !== undefined,
    });
  return (
    <div
      ref={setNodeRef}
      data-appointment-id={appointment.id}
      className={cn(
        "group/event flex min-w-0 items-center gap-0.5 rounded-md border px-1 py-1 text-xs",
        eventColor(appointment),
        isDragging && "opacity-30",
      )}
      aria-busy={appointment.id === pendingId || undefined}
    >
      {writable ? (
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          aria-label={`Mover turno de ${appointment.petName}`}
          disabled={pendingId !== undefined}
          className="text-base-content/45 flex w-5 shrink-0 cursor-grab touch-none items-center justify-center self-stretch rounded-sm active:cursor-grabbing disabled:cursor-not-allowed"
        >
          <GripVerticalIcon aria-hidden="true" className="size-3.5" />
        </button>
      ) : null}
      <button
        type="button"
        onClick={() => onView(appointment.id)}
        aria-label={`Ver turno de ${appointment.petName}, ${calendarTime(appointment.datetime)}`}
        title={`${appointment.petName} · ${appointment.clientName}\n${appointment.services.join(", ")}\nInicio: ${calendarTime(appointment.datetime)}`}
        className="min-w-0 flex-1 rounded-sm px-0.5 text-left"
      >
        <span className="flex items-center justify-between gap-1">
          <span className="truncate font-semibold">{appointment.petName}</span>
          <time
            dateTime={appointment.datetime}
            className="shrink-0 text-[10px] tabular-nums"
          >
            {calendarTime(appointment.datetime)}
          </time>
        </span>
        <span className="text-base-content/55 block truncate text-[10px]">
          {appointment.clientName}
        </span>
      </button>
      {appointment.id === pendingId ? (
        <LoadingSpinner
          aria-label="Guardando horario"
          className="size-3.5 shrink-0"
        />
      ) : writable ? (
        <button
          type="button"
          aria-label={`Editar turno de ${appointment.petName}`}
          className="text-base-content/50 hover:text-base-content shrink-0 rounded-sm p-0.5"
          onClick={() => onEdit(appointment.id)}
        >
          <PencilIcon aria-hidden="true" className="size-3" />
        </button>
      ) : null}
    </div>
  );
}

function MonthDay({
  date,
  state,
  appointments,
  onStateChange,
  onCreate,
  ...eventProps
}: EventProps &
  Pick<CalendarProps, "onStateChange" | "onCreate"> & {
    date: string;
    state: CalendarState;
    appointments: AppointmentSummary[];
  }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `day-${date}`,
    data: { date },
    disabled: !eventProps.canWrite || eventProps.pendingId !== undefined,
  });
  const today = date === calendarDay(new Date());
  const outside = !isSameMonth(calendarDate(date), calendarDate(state.date));
  return (
    <div
      ref={setNodeRef}
      data-calendar-date={date}
      className={cn(
        "group/day border-secondary/25 min-h-24 min-w-0 border-r border-b p-1.5 md:min-h-32 md:p-2",
        outside ? "bg-base-100/70" : "bg-white",
        isOver && "bg-primary/15 ring-primary ring-2 ring-inset",
      )}
    >
      <div className="mb-1.5 flex items-center justify-between gap-1">
        <button
          type="button"
          aria-label={`Ver día ${date}`}
          onClick={() => onStateChange({ view: "day", date })}
          className={cn(
            "flex size-6 items-center justify-center rounded-sm text-xs tabular-nums",
            today
              ? "bg-primary text-primary-content font-semibold"
              : outside
                ? "text-base-content/35"
                : "hover:bg-secondary/20",
          )}
        >
          {calendarDate(date).getDate()}
        </button>
        {eventProps.canWrite ? (
          <button
            type="button"
            aria-label={`Agregar turno el ${date}`}
            disabled={eventProps.pendingId !== undefined}
            onClick={() => onCreate(date + "T09:00")}
            className="text-base-content/45 hover:text-primary hidden rounded-sm p-0.5 md:block"
          >
            <PlusIcon className="size-3.5" />
          </button>
        ) : null}
      </div>
      <div className="hidden space-y-1 md:block">
        {appointments.slice(0, 3).map((appointment) => (
          <CalendarEvent
            key={appointment.id}
            appointment={appointment}
            {...eventProps}
          />
        ))}
        {appointments.length > 3 ? (
          <button
            type="button"
            className="text-base-content/60 px-1 text-xs hover:underline"
            onClick={() => onStateChange({ view: "day", date })}
          >
            +{appointments.length - 3} turnos más
          </button>
        ) : null}
      </div>
      {appointments.length ? (
        <button
          type="button"
          aria-label={`Ver ${appointments.length} turnos del ${date}`}
          className="bg-primary/15 text-base-content flex rounded-sm px-1.5 py-0.5 text-[10px] font-medium md:hidden"
          onClick={() => onStateChange({ view: "day", date })}
        >
          {appointments.length}
        </button>
      ) : null}
    </div>
  );
}

function TimeSlot({
  date,
  time,
  appointments,
  onCreate,
  ...eventProps
}: EventProps &
  Pick<CalendarProps, "onCreate"> & {
    date: string;
    time: string;
    appointments: AppointmentSummary[];
  }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `slot-${date}-${time}`,
    data: { date, time },
    disabled: !eventProps.canWrite || eventProps.pendingId !== undefined,
  });
  return (
    <div
      ref={setNodeRef}
      data-calendar-slot={date + "T" + time}
      className={cn(
        "group/slot border-secondary/25 relative min-h-16 min-w-0 border-r border-b p-1",
        time.endsWith("30") && "border-b-dashed",
        isOver ? "bg-primary/15 ring-primary ring-2 ring-inset" : "bg-white",
      )}
    >
      {eventProps.canWrite ? (
        <button
          type="button"
          aria-label={`Agregar turno el ${date} a las ${time}`}
          disabled={eventProps.pendingId !== undefined}
          onClick={() => onCreate(date + "T" + time)}
          className="text-primary/70 hover:bg-primary/5 focus-visible:bg-primary/10 absolute inset-0 flex items-center justify-center"
        >
          <PlusIcon
            aria-hidden="true"
            className="size-4 opacity-0 group-focus-within/slot:opacity-100 group-hover/slot:opacity-100"
          />
        </button>
      ) : null}
      <div className="pointer-events-none relative space-y-1 [&>div]:pointer-events-auto">
        {appointments.map((appointment) => (
          <CalendarEvent
            key={appointment.id}
            appointment={appointment}
            {...eventProps}
          />
        ))}
      </div>
    </div>
  );
}

function TimedCalendar({
  state,
  appointments,
  onStateChange,
  ...eventProps
}: EventProps &
  Pick<CalendarProps, "onCreate" | "onStateChange"> & {
    state: CalendarState;
    appointments: AppointmentSummary[];
  }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const days = calendarDays(state);
  const firstHour = useRef(
    appointments.length
      ? Math.min(
          ...appointments.map((item) => new Date(item.datetime).getHours()),
        )
      : 8,
  );
  useEffect(() => {
    const scroller = scrollRef.current;
    const time = String(firstHour.current).padStart(2, "0") + ":00";
    const target = scroller?.querySelector<HTMLElement>(
      `[data-hour="${time}"]`,
    );
    if (scroller && target) scroller.scrollTop = target.offsetTop - 56;
  }, []);
  const grouped = new Map<string, AppointmentSummary[]>();
  for (const item of appointments) {
    const date = new Date(item.datetime);
    const slot =
      calendarDay(date) +
      "T" +
      String(date.getHours()).padStart(2, "0") +
      ":" +
      (date.getMinutes() < 30 ? "00" : "30");
    const group = grouped.get(slot) ?? [];
    group.push(item);
    grouped.set(slot, group);
  }
  return (
    <div
      ref={scrollRef}
      className="relative min-h-0 flex-1 overflow-auto overscroll-contain"
    >
      <div
        className={cn(
          "relative grid",
          state.view === "week" && "min-w-[56rem]",
        )}
        style={{
          gridTemplateColumns: `3.5rem repeat(${days.length}, minmax(0, 1fr))`,
        }}
      >
        <div className="bg-base-100 border-secondary/30 text-base-content/45 sticky top-0 z-20 flex h-14 items-center justify-center border-r border-b text-[10px]">
          24 h
        </div>
        {days.map((date) => (
          <button
            type="button"
            key={date}
            onClick={() => onStateChange({ view: "day", date })}
            aria-label={`Ver día ${date}`}
            className="bg-base-100 border-secondary/30 sticky top-0 z-20 flex h-14 items-center justify-center gap-2 border-r border-b text-sm"
          >
            <span className="text-base-content/60 capitalize">
              {format(
                calendarDate(date),
                state.view === "day" ? "EEEE" : "EEE",
                { locale: es },
              )}
            </span>
            <span
              className={cn(
                "flex size-7 items-center justify-center rounded-full font-semibold",
                date === calendarDay(new Date()) &&
                  "bg-primary text-primary-content",
              )}
            >
              {calendarDate(date).getDate()}
            </span>
          </button>
        ))}
        {calendarSlots.map((time) => (
          <Fragment key={time}>
            <div
              data-hour={time}
              className="bg-base-100/50 border-secondary/25 text-base-content/50 min-h-16 border-r border-b px-1 pt-2 text-center text-[10px] tabular-nums"
            >
              {time}
            </div>
            {days.map((date) => (
              <TimeSlot
                key={date + time}
                date={date}
                time={time}
                appointments={grouped.get(date + "T" + time) ?? []}
                {...eventProps}
              />
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

export function AppointmentCalendar({
  state,
  onStateChange,
  appointments,
  canWrite,
  pendingId,
  loading,
  error,
  onCreate,
  onView,
  onEdit,
  onMove,
}: CalendarProps) {
  const [dragId, setDragId] = useState<number>();
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: keyboardCoordinates,
      scrollBehavior: "auto",
    }),
  );
  const range = calendarRange(state);
  const days = calendarDays(state);
  const active = appointments.find((item) => item.id === dragId);
  const grouped = new Map<string, AppointmentSummary[]>();
  for (const item of appointments) {
    const date = calendarDay(new Date(item.datetime));
    const group = grouped.get(date) ?? [];
    group.push(item);
    grouped.set(date, group);
  }
  const eventProps = { canWrite, pendingId, onView, onEdit };
  const dateTitle = format(
    calendarDate(state.date),
    state.view === "day" ? "d 'de' MMMM 'de' yyyy" : "MMMM yyyy",
    { locale: es },
  );
  return (
    <section
      aria-label="Calendario de turnos"
      className="border-secondary/35 bg-base-100 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border shadow-sm"
    >
      <header className="border-secondary/30 flex shrink-0 flex-wrap items-center justify-between gap-3 border-b p-3 sm:p-4">
        <div className="flex min-w-0 items-center gap-3">
          <div
            aria-hidden="true"
            className="border-secondary/40 flex w-12 shrink-0 flex-col overflow-hidden rounded-lg border bg-white text-center"
          >
            <span className="bg-base-100 text-base-content/60 py-0.5 text-[9px] uppercase">
              {format(calendarDate(state.date), "MMM", { locale: es })}
            </span>
            <span className="text-primary py-1 text-lg font-bold">
              {calendarDate(state.date).getDate()}
            </span>
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold first-letter:uppercase sm:text-lg">
                {dateTitle}
              </h2>
              {state.view !== "day" ? (
                <span className="border-secondary/40 rounded border bg-white px-1.5 text-[10px]">
                  Semana{" "}
                  {getWeek(calendarDate(state.date), { weekStartsOn: 1 })}
                </span>
              ) : null}
            </div>
            <p className="text-base-content/55 mt-0.5 text-xs">
              {state.view === "day"
                ? format(calendarDate(state.date), "EEEE", { locale: es })
                : `${format(calendarDate(range.from), "d MMM", { locale: es })} – ${format(calendarDate(range.to), "d MMM yyyy", { locale: es })}`}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="border-secondary/40 flex overflow-hidden rounded-sm border bg-white">
            <button
              type="button"
              aria-label="Período anterior"
              className="hover:bg-secondary/10 flex size-8 items-center justify-center disabled:opacity-40"
              disabled={pendingId !== undefined}
              onClick={() => onStateChange(stepCalendar(state, -1))}
            >
              <ChevronLeftIcon className="size-4" />
            </button>
            <button
              type="button"
              className="border-secondary/40 hover:bg-secondary/10 border-x px-2.5 text-xs font-medium disabled:opacity-40"
              disabled={pendingId !== undefined}
              onClick={() =>
                onStateChange({ ...state, date: calendarDay(new Date()) })
              }
            >
              Hoy
            </button>
            <button
              type="button"
              aria-label="Período siguiente"
              className="hover:bg-secondary/10 flex size-8 items-center justify-center disabled:opacity-40"
              disabled={pendingId !== undefined}
              onClick={() => onStateChange(stepCalendar(state, 1))}
            >
              <ChevronRightIcon className="size-4" />
            </button>
          </div>
          <DatePickerPopover
            value={state.date}
            allowClear={false}
            disabled={pendingId !== undefined}
            aria-label="Ir a fecha"
            className="h-8 w-36 text-xs"
            onChange={(date) => onStateChange({ ...state, date })}
          />
          <SelectInput
            size="sm"
            className="w-28"
            aria-label="Vista del calendario"
            value={state.view}
            disabled={pendingId !== undefined}
            options={[
              { value: "month", label: "Mes" },
              { value: "week", label: "Semana" },
              { value: "day", label: "Día" },
            ]}
            onValueChange={(view) => {
              if (view === "day" || view === "week" || view === "month")
                onStateChange({ ...state, view });
            }}
          />
          {canWrite ? (
            <Button
              size="sm"
              disabled={pendingId !== undefined || loading || Boolean(error)}
              onClick={() => onCreate(state.date + "T09:00")}
            >
              <PlusIcon className="size-4" />
              Agregar turno
            </Button>
          ) : null}
        </div>
      </header>
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        accessibility={{
          screenReaderInstructions: {
            draggable:
              "Para mover un turno, presioná espacio, usá las flechas para elegir un día u horario y presioná espacio para guardar. Escape cancela.",
          },
          announcements: {
            onDragStart: () => "Turno seleccionado para reprogramar.",
            onDragOver: ({ over }) => {
              const target = calendarTargetSchema.safeParse(over?.data.current);
              return target.success
                ? `Destino: ${target.data.date} ${target.data.time ?? ""}.`
                : "Fuera del calendario.";
            },
            onDragEnd: ({ over }) =>
              over ? "Nuevo horario seleccionado." : "Movimiento cancelado.",
            onDragCancel: () => "Movimiento cancelado.",
          },
        }}
        onDragStart={({ active }) => {
          const data = calendarDragSchema.safeParse(active.data.current);
          if (data.success) setDragId(data.data.appointmentId);
        }}
        onDragCancel={() => setDragId(undefined)}
        onDragEnd={({ active, over }) => {
          setDragId(undefined);
          const source = calendarDragSchema.safeParse(active.data.current);
          const target = calendarTargetSchema.safeParse(over?.data.current);
          if (
            source.success &&
            target.success &&
            pendingId === undefined &&
            canWrite
          )
            onMove(source.data.appointmentId, target.data);
        }}
      >
        {loading ? (
          <div
            role="status"
            className="flex min-h-0 flex-1 items-center justify-center gap-3 p-8"
          >
            <LoadingSpinner />{" "}
            <span className="text-base-content/60 text-sm">
              Cargando turnos…
            </span>
          </div>
        ) : error ? (
          <div className="min-h-0 flex-1 overflow-y-auto p-4">{error}</div>
        ) : state.view === "month" ? (
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="bg-base-100 border-secondary/30 text-base-content/60 sticky top-0 z-20 grid grid-cols-7 border-b text-center text-xs">
              {["lun", "mar", "mié", "jue", "vie", "sáb", "dom"].map((day) => (
                <span
                  key={day}
                  className="border-secondary/25 border-r py-2.5 capitalize"
                >
                  {day}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {days.map((date) => (
                <MonthDay
                  key={date}
                  date={date}
                  state={state}
                  appointments={grouped.get(date) ?? []}
                  onStateChange={onStateChange}
                  onCreate={onCreate}
                  {...eventProps}
                />
              ))}
            </div>
          </div>
        ) : (
          <TimedCalendar
            key={state.view + state.date}
            state={state}
            appointments={appointments}
            onStateChange={onStateChange}
            onCreate={onCreate}
            {...eventProps}
          />
        )}
        <DragOverlay dropAnimation={null} transition="none">
          {active ? (
            <div
              className={cn(
                "pointer-events-none rounded-lg border p-2 text-xs shadow-lg",
                eventColor(active),
              )}
            >
              <p className="font-semibold">
                {active.petName} · {calendarTime(active.datetime)}
              </p>
              <p className="text-base-content/60">{active.clientName}</p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
      <footer className="border-secondary/30 text-base-content/55 flex shrink-0 flex-wrap items-center justify-between gap-2 border-t px-3 py-2 text-[10px]">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="bg-primary size-1.5 rounded-full" />
            Agendado
          </span>
          <span className="flex items-center gap-1">
            <span className="bg-info size-1.5 rounded-full" />
            Mantenimiento
          </span>
          <span className="flex items-center gap-1">
            <span className="bg-success size-1.5 rounded-full" />
            Completado
          </span>
          {!appointments.length && !loading && !error ? (
            <span className="flex items-center gap-1">
              <SearchXIcon className="size-3" />
              No hay turnos en este período.
            </span>
          ) : null}
        </div>
        <span>Horarios de este dispositivo · Se muestra la hora de inicio</span>
      </footer>
    </section>
  );
}
