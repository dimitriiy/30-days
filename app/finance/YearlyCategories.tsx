interface YearlyCategoriesProps {
  categories: { name: string; value: number }[];
  total: number;
  currency: string;
}

const money = (value: number, currency: string) => new Intl.NumberFormat("ru-RU", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);

export function YearlyCategories({ categories, total, currency }: YearlyCategoriesProps) {
  return <section className="rounded-[24px] border border-white/10 bg-white/[.045] p-6">
    <h2 className="text-lg font-semibold">Категории за год</h2>
    <p className="mt-1 text-xs text-slate-400">Покупки и переводы в выбранном году</p>
    {categories.length ? <div className="mt-6 grid gap-x-10 gap-y-5 md:grid-cols-2">
      {categories.map((item) => <div key={item.name}>
        <div className="mb-2 flex items-center justify-between gap-4 text-sm"><span className="truncate text-slate-300">{item.name}</span><span className="shrink-0 font-medium">{money(item.value, currency)} <span className="ml-1 text-xs text-slate-500">{Math.round(item.value / total * 100)}%</span></span></div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-violet-400" style={{ width: `${item.value / total * 100}%` }} /></div>
      </div>)}
    </div> : <p className="mt-6 text-sm text-slate-400">За этот год списаний нет</p>}
  </section>;
}
