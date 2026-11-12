"use client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useReducedMotion } from "motion/react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/cn";
import { capitalize, compactMoney, wholeMoney } from "./format";

export type DailyIncome = {
  date: string;
  day: number;
  income: number;
  completed: number;
  scheduled: number;
  isToday: boolean;
};

// The turnos strip below the chart uses a w-16 gutter, so it lines up with
// the plot area only while the Y axis keeps this width.
const Y_AXIS_WIDTH = 64;
const INCOME_STEPS = [10_000, 25_000, 50_000, 100_000, 250_000, 500_000];
const axisTick = {
  fill: "var(--color-base-content)",
  fillOpacity: 0.7,
  fontSize: 10,
  fontFamily: "var(--font-geist-mono)",
};

function incomeScale(data: DailyIncome[]) {
  const max = Math.max(0, ...data.map((item) => item.income));
  const step =
    INCOME_STEPS.find((value) => value * 4 >= max) ??
    Math.ceil(max / 4 / 1_000_000) * 1_000_000;
  return { top: step * 4, ticks: [0, 1, 2, 3, 4].map((index) => index * step) };
}

function chartIndex(value: number | string | null | undefined) {
  if (value === null || value === undefined) return null;
  const index = Number(value);
  return Number.isInteger(index) ? index : null;
}

function countLabel(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function dayDetail(item: DailyIncome) {
  const title =
    capitalize(
      format(new Date(item.date + "T12:00:00"), "EEEE d 'de' MMMM", {
        locale: es,
      }),
    ) + (item.isToday ? " · hoy" : "");
  if (item.completed > 0)
    return {
      title,
      money: wholeMoney(item.income),
      count: countLabel(
        item.completed,
        "turno completado",
        "turnos completados",
      ),
      note: `Ticket promedio ${wholeMoney(Math.round(item.income / item.completed))}`,
    };
  if (item.scheduled > 0)
    return {
      title,
      money: "—",
      count: countLabel(
        item.scheduled,
        "turno programado",
        "turnos programados",
      ),
      note: "La ganancia se registra cuando se completan los turnos",
    };
  return {
    title,
    money: "—",
    count: "Sin turnos",
    note: "No hay turnos cargados para este día",
  };
}

// Recharts clones these elements and injects the position props.
function DayTick({
  x,
  y,
  payload,
  data,
  activeIndex,
}: {
  x?: number;
  y?: number;
  payload?: { index: number };
  data: DailyIncome[];
  activeIndex: number;
}) {
  const item = payload ? data[payload.index] : undefined;
  if (!item) return null;
  const emphasized = item.isToday || payload?.index === activeIndex;
  return (
    <text
      x={x}
      y={y}
      dy={12}
      textAnchor="middle"
      {...axisTick}
      fillOpacity={emphasized ? 1 : axisTick.fillOpacity}
      fontWeight={emphasized ? 700 : 400}
    >
      {item.isToday ? "Hoy" : item.day}
    </text>
  );
}

function ActiveIncomeLabel({
  x,
  y,
  width,
  index,
  value,
  activeIndex,
}: {
  x?: number | string;
  y?: number | string;
  width?: number | string;
  index?: number;
  value?: number | string;
  activeIndex: number;
}) {
  if (index !== activeIndex || !Number(value)) return null;
  return (
    <text
      x={Number(x) + Number(width) / 2}
      y={Number(y) - 6}
      textAnchor="middle"
      fill="var(--color-base-content)"
      fontSize={10}
      fontWeight={600}
      fontFamily="var(--font-geist-mono)"
    >
      {compactMoney(Number(value))}
    </text>
  );
}

export function DailyIncomeChart({
  data,
  monthLabel,
  defaultIndex,
}: {
  data: DailyIncome[];
  monthLabel: string;
  defaultIndex: number;
}) {
  const reduceMotion = useReducedMotion();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const activeIndex = hoveredIndex ?? selectedIndex ?? defaultIndex;
  const active = data[activeIndex] ? dayDetail(data[activeIndex]) : null;
  const scale = incomeScale(data);
  // A thin marker keeps days with only scheduled appointments visible
  // without implying income that has not been earned yet.
  const chartData = data.map((item) => ({
    ...item,
    marker: item.income === 0 && item.scheduled > 0 ? scale.top * 0.012 : 0,
  }));

  return (
    <section
      aria-labelledby="daily-income-title"
      className="bg-base-100 border-base-300 rounded-box flex flex-col gap-4.5 border p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h2 id="daily-income-title" className="text-lg font-bold">
            Ganancia y turnos por día
          </h2>
          <p className="text-base-content/70 mt-1 text-xs">
            {monthLabel} · la altura de cada barra es la ganancia del día; pasá
            el cursor o tocá una barra para ver el detalle
          </p>
        </div>
        {active ? (
          <div className="bg-base-200 rounded-field flex min-w-64 flex-col gap-1 px-3.5 py-2.5">
            <p className="text-xs font-semibold">{active.title}</p>
            <div className="flex items-baseline gap-3.5">
              <span className="font-mono-ui text-xl font-bold">
                {active.money}
              </span>
              <span className="text-[13px]">{active.count}</span>
            </div>
            <p className="text-base-content/70 text-[11px]">{active.note}</p>
          </div>
        ) : null}
      </div>

      <div className="overflow-x-auto">
        <div className="flex min-w-3xl flex-col gap-2">
          <div aria-hidden="true" className="h-67">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                // The chart is hidden from assistive tech; the table below
                // carries the same data, so the SVG must not take focus.
                accessibilityLayer={false}
                margin={{ top: 28, right: 0, bottom: 0, left: 0 }}
                barCategoryGap="30%"
                onMouseMove={(state) =>
                  setHoveredIndex(chartIndex(state.activeTooltipIndex))
                }
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={(state) => {
                  const index = chartIndex(state.activeTooltipIndex);
                  if (index !== null) setSelectedIndex(index);
                }}
              >
                <CartesianGrid
                  vertical={false}
                  stroke="var(--color-base-300)"
                />
                <XAxis
                  dataKey="day"
                  interval={0}
                  axisLine={false}
                  tickLine={false}
                  height={24}
                  tick={<DayTick data={data} activeIndex={activeIndex} />}
                />
                <YAxis
                  width={Y_AXIS_WIDTH}
                  domain={[0, scale.top]}
                  ticks={scale.ticks}
                  axisLine={false}
                  tickLine={false}
                  tick={axisTick}
                  tickFormatter={compactMoney}
                />
                <Tooltip
                  content={() => null}
                  cursor={{
                    fill: "var(--color-primary)",
                    fillOpacity: 0.12,
                    radius: 6,
                  }}
                  isAnimationActive={false}
                />
                <Bar
                  dataKey="income"
                  stackId="day"
                  maxBarSize={22}
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={!reduceMotion}
                >
                  {data.map((item, index) => (
                    <Cell
                      key={item.date}
                      fill={
                        index === activeIndex
                          ? "var(--color-neutral)"
                          : "var(--color-chart-bar)"
                      }
                    />
                  ))}
                  <LabelList
                    dataKey="income"
                    content={<ActiveIncomeLabel activeIndex={activeIndex} />}
                  />
                </Bar>
                <Bar
                  dataKey="marker"
                  stackId="day"
                  maxBarSize={22}
                  radius={[2, 2, 0, 0]}
                  isAnimationActive={!reduceMotion}
                >
                  {data.map((item, index) => (
                    <Cell
                      key={item.date}
                      fill={
                        index === activeIndex
                          ? "var(--color-neutral)"
                          : "var(--color-chart-scheduled)"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div aria-hidden="true" className="flex items-center">
            <span className="text-base-content/70 w-16 shrink-0 pr-2.5 text-right text-[11px] font-semibold">
              Turnos
            </span>
            <div className="bg-base-200 flex flex-1 rounded-lg py-1.5">
              {data.map((item) => (
                <span
                  key={item.date}
                  className={cn(
                    "font-mono-ui min-w-0 flex-1 text-center text-[11px] font-semibold",
                    item.completed > 0
                      ? "text-base-content"
                      : item.scheduled > 0
                        ? "text-base-content/70 italic"
                        : "text-base-content/60",
                  )}
                >
                  {item.completed || item.scheduled || "—"}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="text-base-content/70 flex flex-wrap gap-4.5 text-xs">
        <span className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="bg-chart-bar size-2.5 rounded-xs"
          />
          Ganancia de turnos completados
        </span>
        <span className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="bg-chart-scheduled h-0.75 w-2.5 rounded-xs"
          />
          Día con turnos programados (en cursiva, sin ganancia todavía)
        </span>
      </div>

      <table className="sr-only">
        <caption>Ganancia y turnos por día de {monthLabel}</caption>
        <thead>
          <tr>
            <th scope="col">Día</th>
            <th scope="col">Turnos completados</th>
            <th scope="col">Turnos programados</th>
            <th scope="col">Ganancia</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.date}>
              <th scope="row">{item.day}</th>
              <td>{item.completed}</td>
              <td>{item.scheduled}</td>
              <td>{wholeMoney(item.income)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
