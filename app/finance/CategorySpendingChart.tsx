"use client";

import { useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { categorySpendingBuckets, type Transaction } from "./model";
import { YearlySpendingDetails } from "./YearlySpendingDetails";

interface Bucket { label: string; start: Date; end: Date }
interface CategorySpendingChartProps {
  outflows: Transaction[];
  buckets: Bucket[];
  currency: string;
  title: string;
  compact?: boolean;
}

const colors = ["#9b8cff", "#66d4bf", "#ffbb87", "#80b7ff", "#fa92a6", "#e8d084", "#b3a6f5"];
const money = (value: number, currency: string) => new Intl.NumberFormat("ru-RU", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);

export function CategorySpendingChart({ outflows, buckets, currency, title, compact = false }: CategorySpendingChartProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const { names, data } = categorySpendingBuckets(outflows, buckets);
  const selected = selectedIndex === null ? null : buckets[selectedIndex];
  const selectedLabel = selected?.start.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });

  return <div className="space-y-5">
    <section className="rounded-[24px] border border-white/10 bg-white/[.045] p-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-1 text-xs text-slate-400">Крупнейшие категории, остальные покупки и переводы</p>
      <div className={`${compact ? "h-72" : "h-80"} mt-5`}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }} onClick={(state) => { if (state?.activeTooltipIndex != null) setSelectedIndex(Number(state.activeTooltipIndex)); }}>
            <CartesianGrid vertical={false} stroke="#ffffff16" strokeDasharray="4 4" />
            <XAxis dataKey="label" tick={{ fill: "#8890a9", fontSize: 11 }} tickLine={false} axisLine={false} interval={buckets.length <= 12 ? 0 : buckets.length <= 31 ? 5 : 8} />
            <YAxis tick={{ fill: "#8890a9", fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(value: number) => `${Math.round(value / 1000)}к`} />
            <Tooltip contentStyle={{ background: "#192036", border: "1px solid #ffffff22", borderRadius: 12, color: "white" }} formatter={(value: number) => money(value, currency)} />
            {names.map((name, index) => <Bar key={index} dataKey={`category${index}`} name={name} stackId="spending" fill={colors[index % colors.length]} maxBarSize={42} className="cursor-pointer" />)}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-300">{names.map((name, index) => <span key={index} className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />{name}</span>)}</div>
      <p className="mt-3 text-xs text-violet-200">Нажмите на столбец, чтобы увидеть операции за период.</p>
    </section>
    {selected && selectedLabel && <YearlySpendingDetails key={selected.start.getTime()} outflows={outflows} bucket={selected} label={selectedLabel} currency={currency} onClose={() => setSelectedIndex(null)} />}
  </div>;
}
