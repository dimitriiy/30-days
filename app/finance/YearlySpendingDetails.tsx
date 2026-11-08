"use client";

import { useState } from "react";
import { X } from "lucide-react";

import { expensesForBucket, groupExpensesByCategory, type Transaction } from "./model";

interface YearlySpendingDetailsProps {
  outflows: Transaction[];
  bucket: { start: Date; end: Date };
  label: string;
  currency: string;
  onClose: () => void;
}

const money = (value: number, currency: string) => new Intl.NumberFormat("ru-RU", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);

function ExpenseRow({ expense, currency }: { expense: Transaction; currency: string }) {
  return <div className="flex items-center justify-between gap-4 py-3 text-sm">
    <div className="min-w-0"><p className="truncate font-medium text-white">{expense.description || expense.category}</p><p className="mt-1 text-xs text-slate-500">{expense.date.toLocaleDateString("ru-RU", { day: "numeric", month: "long" })} · {expense.category}</p></div>
    <span className="shrink-0 font-semibold text-white">−{money(-expense.amount, currency)}</span>
  </div>;
}

export function YearlySpendingDetails({ outflows, bucket, label, currency, onClose }: YearlySpendingDetailsProps) {
  const [view, setView] = useState<"list" | "categories">("list");
  const [sort, setSort] = useState<"newest" | "oldest" | "largest" | "smallest">("newest");
  const selected = expensesForBucket(outflows, bucket);
  const sorted = [...selected].sort((a, b) => {
    if (sort === "oldest") return a.date.getTime() - b.date.getTime();
    if (sort === "largest") return a.amount - b.amount;
    if (sort === "smallest") return b.amount - a.amount;
    return b.date.getTime() - a.date.getTime();
  });
  const categories = groupExpensesByCategory(selected);
  const total = selected.reduce((sum, item) => sum - item.amount, 0);

  return <section id="year-spending-details" className="rounded-[24px] border border-violet-300/20 bg-violet-300/[.055] p-6">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[.15em] text-violet-300">Детализация периода</p><h3 className="mt-2 text-xl font-semibold capitalize">{label}</h3><p className="mt-1 text-sm text-slate-400">{selected.length} списаний · {money(total, currency)}</p></div><div className="flex flex-wrap items-center gap-2"><label className="flex items-center gap-2 text-xs text-slate-400">Сортировка <select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)} className="rounded-lg border border-white/10 bg-[#192036] px-2 py-2 text-white"><option value="newest">Сначала новые</option><option value="oldest">Сначала старые</option><option value="largest">Сначала крупные</option><option value="smallest">Сначала небольшие</option></select></label><div className="flex rounded-xl border border-white/10 bg-white/[.06] p-1"><button type="button" onClick={() => setView("list")} aria-pressed={view === "list"} className={`rounded-lg px-3 py-1.5 text-xs ${view === "list" ? "bg-violet-400/25 text-white" : "text-slate-400"}`}>Список</button><button type="button" onClick={() => setView("categories")} aria-pressed={view === "categories"} className={`rounded-lg px-3 py-1.5 text-xs ${view === "categories" ? "bg-violet-400/25 text-white" : "text-slate-400"}`}>По категориям</button></div><button type="button" onClick={onClose} aria-label="Закрыть детализацию" className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"><X size={17} /></button></div></div>
    {!selected.length ? <p className="mt-6 text-sm text-slate-400">В этом периоде списаний нет.</p> : view === "list" ? <div className="mt-5 divide-y divide-white/10">{sorted.map((expense, index) => <ExpenseRow key={`${expense.date.getTime()}-${index}`} expense={expense} currency={currency} />)}</div> : <div className="mt-5 space-y-5">{categories.map((category) => <div key={category.name}><div className="flex items-center justify-between gap-3 border-b border-white/10 pb-2"><h4 className="font-medium">{category.name}</h4><span className="text-sm font-semibold">{money(category.value, currency)}</span></div><div className="divide-y divide-white/10">{sorted.filter((expense) => expense.category === category.name).map((expense, index) => <ExpenseRow key={`${expense.date.getTime()}-${index}`} expense={expense} currency={currency} />)}</div></div>)}</div>}
  </section>;
}
