import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { z } from "zod";

export type CalendarView = "month" | "week" | "day";
export type CalendarState = { view: CalendarView; date: string };
export const calendarTargetSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
    .optional(),
});
export type CalendarTarget = z.infer<typeof calendarTargetSchema>;
export const calendarDragSchema = z.object({
  appointmentId: z.number().int().positive(),
});
export const calendarDate = (date: string) => new Date(date + "T12:00:00");
export const calendarDay = (date: Date) => format(date, "yyyy-MM-dd");
export const calendarTime = (datetime: string) =>
  format(new Date(datetime), "HH:mm");

export function calendarRange({ view, date }: CalendarState) {
  const day = calendarDate(date);
  const from =
    view === "month"
      ? startOfWeek(startOfMonth(day), { weekStartsOn: 1 })
      : view === "week"
        ? startOfWeek(day, { weekStartsOn: 1 })
        : day;
  const to =
    view === "month"
      ? endOfWeek(endOfMonth(day), { weekStartsOn: 1 })
      : view === "week"
        ? endOfWeek(day, { weekStartsOn: 1 })
        : day;
  return { from: calendarDay(from), to: calendarDay(to) };
}
export function calendarDays(state: CalendarState) {
  const range = calendarRange(state);
  return eachDayOfInterval({
    start: calendarDate(range.from),
    end: calendarDate(range.to),
  }).map(calendarDay);
}
export function stepCalendar(
  state: CalendarState,
  direction: number,
): CalendarState {
  const date =
    state.view === "month"
      ? addMonths(calendarDate(state.date), direction)
      : addDays(
          calendarDate(state.date),
          direction * (state.view === "week" ? 7 : 1),
        );
  return { ...state, date: calendarDay(date) };
}
export function movedAppointmentTime(datetime: string, target: CalendarTarget) {
  const previous = new Date(datetime);
  const time = target.time ?? format(previous, "HH:mm");
  const requested = target.date + "T" + time;
  const next = new Date(requested);
  if (
    !Number.isFinite(next.getTime()) ||
    format(next, "yyyy-MM-dd'T'HH:mm") !== requested
  ) {
    return null;
  }
  if (!target.time)
    next.setSeconds(previous.getSeconds(), previous.getMilliseconds());
  return next.toISOString();
}
export const calendarSlots = Array.from(
  { length: 48 },
  (_, index) =>
    String(Math.floor(index / 2)).padStart(2, "0") +
    ":" +
    (index % 2 ? "30" : "00"),
);
