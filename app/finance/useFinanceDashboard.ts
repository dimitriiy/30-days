import { useMemo, useState } from "react";
import { parseTransactions, summarize, yearlySpending, type Period, type Transaction } from "./model";
import { readBankFile } from "./wasm-client";

export function useFinanceDashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState<Period>("year");
  const [anchor, setAnchor] = useState(() => new Date());
  const [tab, setTab] = useState<"expenses" | "transfers">("expenses");

  const summary = useMemo(() => summarize(transactions, period, anchor), [transactions, period, anchor]);
  const yearly = useMemo(() => period === "year" ? yearlySpending(summary.outflows, anchor.getFullYear()) : null, [period, summary, anchor]);
  const currency = transactions[0]?.currency ?? "RUB";
  const periodLabel = period === "week"
    ? `${summary.start.toLocaleDateString("ru-RU", { day: "numeric", month: "long" })} — ${new Date(summary.end.getTime() - 86400000).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}`
    : period === "year" ? `${anchor.getFullYear()} год` : summary.start.toLocaleDateString("ru-RU", { month: "long", year: "numeric" });
  const activeDays = yearly?.coverageDays ?? Math.max(1, Math.min(summary.days, Math.ceil((Math.min(Date.now(), summary.end.getTime()) - summary.start.getTime()) / 86400000)));
  const averageWeek = yearly?.averageWeek ?? summary.outflowTotal / activeDays * 7;
  const averageMonth = yearly?.averageMonth ?? summary.outflowTotal / activeDays * 30.44;

  async function loadFile(file?: File): Promise<void> {
    if (!file) return;
    if (!/\.(xlsx|csv)$/i.test(file.name)) { setError("Выберите файл в формате .xlsx или .csv"); return; }
    setLoading(true);
    setError("");
    try {
      const parsed = parseTransactions(await readBankFile(file));
      if (new Set(parsed.map((item) => item.currency)).size > 1) throw new Error("В выписке несколько валют счёта. Загрузите выписку с одной валютой, чтобы суммы складывались корректно.");
      setTransactions(parsed);
      setAnchor(parsed[0].date);
      setFileName(file.name);
      setTab("expenses");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Не удалось прочитать файл.");
    } finally {
      setLoading(false);
    }
  }

  function selectPeriod(next: Period): void {
    setPeriod(next);
    if (transactions.length) setAnchor(transactions[0].date);
  }

  return { transactions, fileName, error, loading, period, anchor, tab, summary, yearly, currency, periodLabel, activeDays, averageWeek, averageMonth, loadFile, selectPeriod, setAnchor, setTab };
}
