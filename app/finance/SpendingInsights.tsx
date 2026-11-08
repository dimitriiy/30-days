import { useState } from "react";

import { spendingInsights, yearlyPurchaseHistory, type Transaction } from "./model";
import { SpendingHistoryChart } from "./SpendingHistoryChart";

interface SpendingInsightsProps {
  expenses: Transaction[];
  transactions: Transaction[];
  currency: string;
  year: number;
}

const money = (value: number, currency: string) => new Intl.NumberFormat("ru-RU", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);

export function SpendingInsights({ expenses, transactions, currency, year }: SpendingInsightsProps) {
  const [selected, setSelected] = useState<{ category: string; name: string } | null>(null);
  const { total, topCategory, categories } = spendingInsights(expenses);

  return <section className="mt-5 rounded-[24px] border border-white/10 bg-white/[.045] p-6">
    <h2 className="text-lg font-semibold">Итоги за период</h2>
    <p className="mt-1 text-xs text-slate-400">Покупки без переводов</p>
    {!topCategory ? <p className="mt-6 text-sm text-slate-400">За этот период покупок нет.</p> : <div className="mt-6 space-y-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-[.14em] text-violet-300">Больше всего потрачено</p>
        <p className="mt-3 text-xl font-semibold">{topCategory.name}</p>
        <p className="mt-2 text-sm text-slate-300">{money(topCategory.value, currency)} · {Math.round(topCategory.value / total * 100)}% покупок</p>
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-[.14em] text-teal-300">Все уникальные траты по категориям</p>
        <div className="mt-4 space-y-6">{categories.map((category) => <div key={category.name}>
          <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-2"><h3 className="font-medium">{category.name}</h3><span className="shrink-0 text-sm font-semibold">{money(category.value, currency)}</span></div>
          <div className="divide-y divide-white/10">{category.items.map((item) => {
            const isSelected = selected?.category === category.name && selected.name === item.name;
            return <div key={item.name.toLocaleLowerCase("ru-RU")}>
              <button type="button" aria-expanded={isSelected} onClick={() => setSelected(isSelected ? null : { category: category.name, name: item.name })} className="flex w-full items-center justify-between gap-3 py-2 text-left text-sm hover:text-teal-200"><span className="min-w-0">{item.name} <span className="text-slate-500">· операций: {item.count}</span></span><span className="shrink-0 font-medium">{money(item.value, currency)}</span></button>
              {isSelected && <SpendingHistoryChart transactions={yearlyPurchaseHistory(transactions, category.name, item.name, year)} currency={currency} year={year} />}
            </div>;
          })}</div>
        </div>)}</div>
      </div>
    </div>}
  </section>;
}
