"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { yearlySpending, type Transaction } from "./model";
import { YearlySpendingDetails } from "./YearlySpendingDetails";

interface YearlySpendingChartProps {
  spending: ReturnType<typeof yearlySpending>;
  outflows: Transaction[];
  year: number;
  currency: string;
}

const money = (value: number, currency: string) =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);

export function YearlySpendingChart({
  spending,
  outflows,
  year,
  currency,
}: YearlySpendingChartProps) {
  const [scale, setScale] = useState<"month" | "week">("month");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const { months, weeks, averageMonth, averageWeek } = spending;
  const data = scale === "month" ? months : weeks;
  const average = scale === "month" ? averageMonth : averageWeek;
  const selected = selectedIndex === null ? null : data[selectedIndex];
  const selectedLabel = selected && (scale === "month"
    ? selected.start.toLocaleDateString("ru-RU", { month: "long", year: "numeric" })
    : `${selected.start.toLocaleDateString("ru-RU", { day: "numeric", month: "long" })} — ${new Date(selected.end.getTime() - 86400000).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}`);

  return (
    <div className="space-y-5">
    <section className="rounded-[24px] border border-white/10 bg-white/[.045] p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Все списания за {year} год</h2>
          <p className="mt-1 text-xs text-slate-400">
            Покупки и исходящие переводы · нулевые периоды тоже показаны
          </p>
        </div>
        <div className="flex rounded-xl border border-white/10 bg-white/[.06] p-1">
          {(["month", "week"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => { setScale(value); setSelectedIndex(null); }}
              aria-pressed={scale === value}
              className={`rounded-lg px-3 py-1.5 text-xs transition ${scale === value ? "bg-violet-400/25 text-white" : "text-slate-400 hover:text-white"}`}
            >
              {value === "month" ? "По месяцам" : "По неделям"}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <span className="text-slate-400">
          Среднее за месяц{" "}
          <strong className="ml-1 font-semibold text-white">
            {money(averageMonth, currency)}
          </strong>
        </span>
        <span className="text-slate-400">
          Среднее за неделю{" "}
          <strong className="ml-1 font-semibold text-white">
            {money(averageWeek, currency)}
          </strong>
        </span>
      </div>
      <div className="mt-5 h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 12, right: 8, left: -14, bottom: 0 }}
          >
            <CartesianGrid
              vertical={false}
              stroke="#ffffff16"
              strokeDasharray="4 4"
            />
            <XAxis
              dataKey="label"
              tick={{ fill: "#8890a9", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              interval={scale === "month" ? 0 : 5}
            />
            <YAxis
              tick={{ fill: "#8890a9", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: number) => `${Math.round(value / 1000)}к`}
            />
            <Tooltip
              contentStyle={{
                background: "#192036",
                border: "1px solid #ffffff22",
                borderRadius: 12,
                color: "white",
              }}
              formatter={(value: number) => money(value, currency)}
            />
            <Bar
              dataKey="value"
              name="Все списания"
              fill="#a797ff"
              radius={[5, 5, 0, 0]}
              maxBarSize={42}
              onClick={(_, index) => setSelectedIndex(index)}
              className="cursor-pointer"
            >
              {data.map((bucket, index) => <Cell key={bucket.start.getTime()} fill={index === selectedIndex ? "#66d4bf" : "#a797ff"} />)}
            </Bar>
            {average > 0 && (
              <ReferenceLine
                y={average}
                stroke="#66d4bf"
                strokeDasharray="5 5"
                strokeWidth={2}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
        <span className="h-0.5 w-5 bg-violet-300" /> Все списания{" "}
        <span className="ml-4 h-0.5 w-5 border-t-2 border-dashed border-teal-300" />{" "}
        Среднее за {scale === "month" ? "месяц" : "неделю"}
      </div>
      <p className="mt-3 text-xs text-slate-500">
        Среднее рассчитано за период от первого до последнего списания в выбранном
        году, включая промежутки без операций.
      </p>
      <p className="mt-2 text-xs text-violet-200">Нажмите на столбец, чтобы увидеть все списания за этот период.</p>
    </section>
    {selected && selectedLabel && <YearlySpendingDetails key={`${scale}-${selectedIndex}`} outflows={outflows} bucket={selected} label={selectedLabel} currency={currency} onClose={() => setSelectedIndex(null)} />}
    </div>
  );
}
