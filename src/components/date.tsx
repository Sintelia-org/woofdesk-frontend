"use client";

import { useEffect, useRef, useState, type ComponentProps } from "react";
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { es } from "date-fns/locale";
import {
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import {
  useController,
  type Control,
  type FieldPathByValue,
  type FieldValues,
} from "react-hook-form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn/popover";
import { Input } from "@/components/shadcn/input";
import { PickerOptions, PickerSearch } from "@/components/select-input";
import { cn } from "@/lib/cn";

const toDate = (value: string) => new Date(value + "T12:00:00");
const toValue = (value: Date) => format(value, "yyyy-MM-dd");

// Adapted from Gargano's date picker, preserving date-only strings at the API boundary.
export function DatePicker({
  value,
  onChange,
  min,
  max,
}: {
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
}) {
  const [month, setMonth] = useState(() =>
    startOfMonth(value ? toDate(value) : new Date()),
  );
  const [focusTarget, setFocusTarget] = useState("");
  const [panel, setPanel] = useState<"month" | "year" | null>(null);
  const [search, setSearch] = useState("");
  const calendarRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (focusTarget)
      calendarRef.current
        ?.querySelector<HTMLButtonElement>(`[data-day="${focusTarget}"]`)
        ?.focus();
  }, [focusTarget]);
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }),
  });
  const today = toValue(new Date());
  const firstYear = min ? toDate(min).getFullYear() : 1900;
  const lastYear = max
    ? toDate(max).getFullYear()
    : Math.max(new Date().getFullYear() + 10, month.getFullYear());
  const disabled = (day: string) =>
    Boolean((min && day < min) || (max && day > max));
  const selectedInMonth = days.some((day) => toValue(day) === value);
  return (
    <div className="w-72 max-w-full p-3">
      <div className="mb-3 flex items-center gap-1">
        <button
          type="button"
          aria-label="Mes anterior"
          className="btn btn-ghost btn-sm btn-square shrink-0"
          disabled={Boolean(
            min && toValue(endOfMonth(addMonths(month, -1))) < min,
          )}
          onClick={() => setMonth(addMonths(month, -1))}
        >
          <ChevronLeftIcon className="size-4" />
        </button>
        <button
          type="button"
          aria-label="Mes"
          aria-expanded={panel === "month"}
          className="picker-trigger h-8 min-w-0 flex-1 px-2 text-xs capitalize"
          onClick={() => {
            setPanel(panel === "month" ? null : "month");
            setSearch("");
          }}
        >
          {format(month, "MMMM", { locale: es })}
        </button>
        <button
          type="button"
          aria-label="Año"
          aria-expanded={panel === "year"}
          className="picker-trigger h-8 w-20 shrink-0 px-2 text-xs"
          onClick={() => {
            setPanel(panel === "year" ? null : "year");
            setSearch("");
          }}
        >
          {month.getFullYear()}
        </button>
        <button
          type="button"
          aria-label="Mes siguiente"
          className="btn btn-ghost btn-sm btn-square shrink-0"
          disabled={Boolean(
            max && toValue(startOfMonth(addMonths(month, 1))) > max,
          )}
          onClick={() => setMonth(addMonths(month, 1))}
        >
          <ChevronRightIcon className="size-4" />
        </button>
      </div>
      {panel ? (
        <div className="border-secondary/25 overflow-hidden rounded-md border">
          <PickerSearch
            value={search}
            onChange={setSearch}
            label={panel === "year" ? "Buscar año" : "Buscar mes"}
          />
          <div className="max-h-56 overflow-y-auto">
            <PickerOptions
              entityName={panel === "year" ? "años" : "meses"}
              value={String(
                panel === "year" ? month.getFullYear() : month.getMonth(),
              )}
              options={(panel === "year"
                ? Array.from(
                    { length: Math.max(1, lastYear - firstYear + 1) },
                    (_, index) => ({
                      value: String(lastYear - index),
                      label: String(lastYear - index),
                    }),
                  )
                : Array.from({ length: 12 }, (_, index) => ({
                    value: String(index),
                    label: format(new Date(2024, index, 1), "MMMM", {
                      locale: es,
                    }),
                  }))
              ).filter((option) =>
                option.label
                  .toLocaleLowerCase("es")
                  .includes(search.toLocaleLowerCase("es")),
              )}
              onSelect={(next) => {
                setMonth(
                  panel === "year"
                    ? new Date(Number(next), month.getMonth(), 1)
                    : new Date(month.getFullYear(), Number(next), 1),
                );
                setPanel(null);
                setSearch("");
              }}
            />
          </div>
        </div>
      ) : (
        <>
          <div
            aria-hidden="true"
            className="text-base-content/50 mb-2 grid grid-cols-7 text-center text-xs font-medium"
          >
            {["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div
            ref={calendarRef}
            role="group"
            aria-label={format(month, "MMMM yyyy", { locale: es })}
            className="grid grid-cols-7 gap-1"
            onKeyDown={(event) => {
              const target = event.target;
              if (!(target instanceof HTMLButtonElement) || !target.dataset.day)
                return;
              const day = toDate(target.dataset.day);
              let next: Date;
              if (event.key === "ArrowRight") next = addDays(day, 1);
              else if (event.key === "ArrowLeft") next = addDays(day, -1);
              else if (event.key === "ArrowDown") next = addDays(day, 7);
              else if (event.key === "ArrowUp") next = addDays(day, -7);
              else if (event.key === "Home")
                next = startOfWeek(day, { weekStartsOn: 1 });
              else if (event.key === "End")
                next = endOfWeek(day, { weekStartsOn: 1 });
              else return;
              event.preventDefault();
              if (disabled(toValue(next))) return;
              setMonth(startOfMonth(next));
              setFocusTarget(toValue(next));
            }}
          >
            {days.map((day) => {
              const key = toValue(day);
              return (
                <button
                  key={key}
                  type="button"
                  data-day={key}
                  disabled={disabled(key)}
                  aria-label={format(day, "EEEE d 'de' MMMM 'de' yyyy", {
                    locale: es,
                  })}
                  aria-pressed={key === value}
                  aria-current={key === today ? "date" : undefined}
                  tabIndex={
                    key === value ||
                    (!selectedInMonth && key === toValue(startOfMonth(month)))
                      ? 0
                      : -1
                  }
                  className={cn(
                    "flex aspect-square items-center justify-center rounded-sm text-sm disabled:cursor-not-allowed disabled:opacity-25",
                    key === value
                      ? "bg-primary text-primary-content font-semibold"
                      : "hover:bg-secondary/30",
                    !isSameMonth(day, month) &&
                      key !== value &&
                      "text-base-content/35",
                    key === today &&
                      key !== value &&
                      "text-primary ring-primary/40 font-semibold ring-1 ring-inset",
                  )}
                  onClick={() => onChange(key)}
                >
                  <time dateTime={key}>{day.getDate()}</time>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

type DatePickerPopoverProps = Omit<
  ComponentProps<typeof PopoverTrigger>,
  "value" | "onChange" | "children" | "defaultValue"
> & {
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  placeholder?: string;
  allowClear?: boolean;
};

export function DatePickerPopover({
  value,
  onChange,
  min,
  max,
  placeholder = "Seleccionar fecha",
  allowClear = true,
  className,
  ...props
}: DatePickerPopoverProps) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        type="button"
        className={cn("picker-trigger", className)}
        {...props}
      >
        <span className={cn("truncate", !value && "text-base-content/50")}>
          {value ? format(toDate(value), "dd/MM/yyyy") : placeholder}
        </span>
        <CalendarDaysIcon
          aria-hidden="true"
          className="text-base-content/50 size-4 shrink-0"
        />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={4}
        collisionPadding={12}
        aria-label="Elegir fecha"
        className="picker-content z-[70] max-h-[var(--radix-popover-content-available-height)] w-72 max-w-[calc(100vw-1.5rem)] min-w-0 overflow-y-auto"
      >
        <DatePicker
          value={value}
          min={min}
          max={max}
          onChange={(next) => {
            onChange(next);
            setOpen(false);
          }}
        />
        {allowClear && value ? (
          <div className="border-secondary/25 border-t p-2">
            <button
              type="button"
              className="btn btn-ghost btn-sm w-full"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
            >
              Quitar fecha
            </button>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

export function FormDatePicker<T extends FieldValues>({
  control,
  name,
  ...props
}: Omit<DatePickerPopoverProps, "value" | "onChange" | "name"> & {
  control: Control<T>;
  name: FieldPathByValue<T, string>;
}) {
  const { field, fieldState } = useController({ control, name });
  return (
    <DatePickerPopover
      {...props}
      name={field.name}
      ref={field.ref}
      onBlur={field.onBlur}
      value={typeof field.value === "string" ? field.value : ""}
      onChange={field.onChange}
      aria-invalid={fieldState.invalid || props["aria-invalid"]}
    />
  );
}

export function FormDateTimePicker<T extends FieldValues>({
  control,
  name,
  id,
  className,
  ...props
}: Omit<
  DatePickerPopoverProps,
  "value" | "onChange" | "name" | "min" | "max"
> & {
  control: Control<T>;
  name: FieldPathByValue<T, string>;
}) {
  const { field, fieldState } = useController({ control, name });
  const [date = "", time = ""] =
    typeof field.value === "string" ? field.value.split("T") : [];
  const invalid = fieldState.invalid || props["aria-invalid"];
  return (
    <div className={cn("flex min-w-0 gap-2", className)}>
      <DatePickerPopover
        {...props}
        id={id}
        ref={field.ref}
        onBlur={field.onBlur}
        className="min-w-0 flex-1"
        allowClear={false}
        value={date}
        onChange={(next) => field.onChange(next + "T" + time)}
        aria-invalid={invalid}
      />
      <Input
        type="time"
        aria-label="Hora del turno (de este dispositivo)"
        aria-describedby={props["aria-describedby"]}
        aria-invalid={invalid}
        className="w-28 shrink-0"
        value={time}
        onBlur={field.onBlur}
        onChange={(event) => field.onChange(date + "T" + event.target.value)}
      />
    </div>
  );
}
