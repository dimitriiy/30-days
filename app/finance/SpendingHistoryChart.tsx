import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { Transaction } from "./model";

interface SpendingHistoryChartProps {
  transactions: Transaction[];
  currency: string;
  year: number;
}

const money = (value: number, currency: string) => new Intl.NumberFormat("ru-RU", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);

export function SpendingHistoryChart({ transactions, currency, year }: SpendingHistoryChartProps) {
  const amountsByDay = new Map<string, number>();
  for (const item of transactions) {
    const key = `${item.date.getMonth()}-${item.date.getDate()}`;
    amountsByDay.set(key, (amountsByDay.get(key) ?? 0) - item.amount);
  }
  const dayCount = new Date(year, 1, 29).getMonth() === 1 ? 366 : 365;
  const data = Array.from({ length: dayCount }, (_, dayIndex) => {
    const date = new Date(year, 0, dayIndex + 1);
    const key = `${date.getMonth()}-${date.getDate()}`;
    return { date: date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" }), amount: amountsByDay.get(key) ?? 0 };
  });

  return <div className="py-4">
    <p className="mb-3 text-xs text-slate-400">Покупки по дням за {year} год · {transactions.length} операций</p>
    <div className="scrollbar-shadcn max-w-full overflow-x-auto overscroll-x-contain">
      <div className="h-64 min-w-[1800px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#ffffff16" strokeDasharray="4 4" />
            <XAxis dataKey="date" tick={{ fill: "#8890a9", fontSize: 10 }} tickLine={false} axisLine={false} interval={13} minTickGap={8} />
            <YAxis tick={{ fill: "#8890a9", fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(value: number) => `${Math.round(value / 1000)}к`} />
            <Tooltip contentStyle={{ background: "#192036", border: "1px solid #ffffff22", borderRadius: 12, color: "white" }} formatter={(value: number) => money(value, currency)} />
            <Bar dataKey="amount" name="Покупка" fill="#66d4bf" maxBarSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>;
}
