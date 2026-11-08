export interface Transaction {
  date: Date;
  amount: number;
  currency: string;
  category: string;
  description: string;
  message: string;
  isTransfer: boolean;
}

export type Period = "week" | "month" | "year";
type Cell = string | number | boolean | Date | null;

const required = ["Дата операции", "Сумма в валюте счёта", "Валюта счёта", "Описание"];

function numberFromCell(value: Cell): number {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return NaN;
  return Number(value.replace(/\s|\u00a0/g, "").replace(",", "."));
}

function dateFromCell(value: Cell): Date {
  if (value instanceof Date) return value;
  if (typeof value === "number") {
    const days = Math.floor(value);
    const time = Math.round((value - days) * 86400000);
    const calendarDate = new Date(Date.UTC(1899, 11, 30 + days));
    return new Date(calendarDate.getUTCFullYear(), calendarDate.getUTCMonth(), calendarDate.getUTCDate(), 0, 0, 0, time);
  }
  if (typeof value === "string") {
    const match = value.trim().match(/^(\d{2})\.(\d{2})\.(\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/);
    if (match) {
      const day = Number(match[1]);
      const month = Number(match[2]);
      const year = Number(match[3]);
      const hour = Number(match[4] ?? 0);
      const minute = Number(match[5] ?? 0);
      const second = Number(match[6] ?? 0);
      const date = new Date(year, month - 1, day, hour, minute, second);
      if (date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day && hour < 24 && minute < 60 && second < 60) return date;
    }
  }
  return new Date(NaN);
}

export function parseTransactions(rows: Cell[][]): Transaction[] {
  const headerIndex = rows.findIndex((row) => required.every((name) => row.some((value) => String(value).trim() === name)));
  if (headerIndex < 0) throw new Error("Не найдены нужные столбцы. Загрузите выписку с датой, суммой в валюте счёта, валютой счёта и описанием.");
  const headers = rows[headerIndex].map((value) => String(value).trim());
  const cell = (row: Cell[], name: string): Cell => row[headers.indexOf(name)] ?? null;

  const transactions = rows.slice(headerIndex + 1).flatMap((row) => {
    const date = dateFromCell(cell(row, "Дата операции"));
    const amount = numberFromCell(cell(row, "Сумма в валюте счёта"));
    if (Number.isNaN(date.getTime()) || !Number.isFinite(amount) || amount === 0) return [];
    const status = String(cell(row, "Статус") ?? "Ок").trim().toLowerCase();
    const analytics = String(cell(row, "Учёт в аналитике") ?? "Да").trim().toLowerCase();
    if (status !== "ок" || analytics === "нет") return [];

    const category = String(cell(row, "Ваша категория") || cell(row, "Категория по-умолчанию") || "Другое").trim();
    const description = String(cell(row, "Описание") ?? "").trim();
    const message = String(cell(row, "Сообщение") ?? "").trim();
    const isTransfer = /перевод|transfer|сбп|по номеру телефона|пополнение карты/i.test(`${category} ${description}`);
    return [{ date, amount, currency: String(cell(row, "Валюта счёта") ?? "RUB"), category, description, message, isTransfer }];
  });
  if (!transactions.length) throw new Error("В файле не найдено подходящих операций.");
  return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
}

export function periodBounds(period: Period, anchor: Date): { start: Date; end: Date; days: number } {
  const start = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate());
  if (period === "week") start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  else if (period === "month") start.setDate(1);
  else start.setMonth(0, 1);
  const end = new Date(start);
  if (period === "week") end.setDate(end.getDate() + 7);
  else if (period === "month") end.setMonth(end.getMonth() + 1);
  else end.setFullYear(end.getFullYear() + 1);
  return { start, end, days: Math.round((end.getTime() - start.getTime()) / 86400000) };
}

export function shiftPeriod(anchor: Date, period: Period, direction: number): Date {
  if (period === "week") return new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() + direction * 7);
  if (period === "year") return new Date(anchor.getFullYear() + direction, 0, 1);
  return new Date(anchor.getFullYear(), anchor.getMonth() + direction, 1);
}

export function groupExpensesByCategory(expenses: Transaction[]) {
  return Array.from(expenses.reduce((groups, item) => groups.set(item.category, (groups.get(item.category) ?? 0) - item.amount), new Map<string, number>()))
    .map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}

export function expensesForBucket(expenses: Transaction[], bucket: { start: Date; end: Date }): Transaction[] {
  return expenses.filter((item) => item.date >= bucket.start && item.date < bucket.end);
}

export function spendingInsights(expenses: Transaction[]) {
  const purchases = expenses.filter((item) => item.amount < 0 && !item.isTransfer);
  const total = purchases.reduce((sum, item) => sum - item.amount, 0);
  const topCategory = groupExpensesByCategory(purchases)[0] ?? null;
  const groups = new Map<string, Map<string, { name: string; value: number; count: number }>>();
  for (const item of purchases) {
    const name = item.description.trim().replace(/\s+/g, " ") || item.category;
    const key = name.toLocaleLowerCase("ru-RU");
    const category = groups.get(item.category) ?? new Map<string, { name: string; value: number; count: number }>();
    const group = category.get(key) ?? { name, value: 0, count: 0 };
    group.value -= item.amount;
    group.count += 1;
    category.set(key, group);
    groups.set(item.category, category);
  }
  const categories = groupExpensesByCategory(purchases).map(({ name, value }) => ({
    name,
    value,
    items: Array.from(groups.get(name)?.values() ?? []).sort((a, b) => b.value - a.value),
  }));
  return { total, topCategory, categories };
}

export function yearlyPurchaseHistory(transactions: Transaction[], category: string, description: string, year: number): Transaction[] {
  const normalizedDescription = description.trim().replace(/\s+/g, " ").toLocaleLowerCase("ru-RU");
  return transactions.filter((item) =>
    item.amount < 0 && !item.isTransfer && item.category === category && item.date.getFullYear() === year &&
    (item.description.trim().replace(/\s+/g, " ") || item.category).toLocaleLowerCase("ru-RU") === normalizedDescription,
  ).sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function categorySpendingBuckets(outflows: Transaction[], buckets: { label: string; start: Date; end: Date }[]) {
  const topCategories = groupExpensesByCategory(outflows.filter((item) => !item.isTransfer)).slice(0, 5).map((item) => item.name);
  const hasOther = outflows.some((item) => !item.isTransfer && !topCategories.includes(item.category));
  const hasTransfers = outflows.some((item) => item.isTransfer);
  const names = [...topCategories, ...(hasOther ? ["Остальное"] : []), ...(hasTransfers ? ["Переводы"] : [])];
  const data = buckets.map((bucket) => {
    const values: Record<string, number> = {};
    for (const item of expensesForBucket(outflows, bucket)) {
      const index = item.isTransfer ? names.length - 1 : topCategories.includes(item.category) ? topCategories.indexOf(item.category) : topCategories.length;
      const key = `category${index}`;
      values[key] = (values[key] ?? 0) - item.amount;
    }
    return { ...bucket, ...values };
  });
  return { names, data };
}

export function yearlySpending(transactions: Transaction[], year: number) {
  const outflows = transactions.filter((item) => item.date.getFullYear() === year && item.amount < 0);
  const bucketTotal = (start: Date, end: Date) => outflows.filter((item) => item.date >= start && item.date < end).reduce((sum, item) => sum - item.amount, 0);
  const months = Array.from({ length: 12 }, (_, index) => {
    const start = new Date(year, index, 1);
    const end = new Date(year, index + 1, 1);
    return {
      label: start.toLocaleDateString("ru-RU", { month: "short" }),
      value: bucketTotal(start, end),
      start,
      end,
    };
  });
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year + 1, 0, 1);
  const weeks: { label: string; value: number; start: Date; end: Date }[] = [];
  for (let start = yearStart; start < yearEnd;) {
    const end = new Date(start);
    end.setDate(end.getDate() + (7 - ((start.getDay() + 6) % 7)));
    if (end > yearEnd) end.setTime(yearEnd.getTime());
    weeks.push({
      label: start.toLocaleDateString("ru-RU", { day: "numeric", month: "short" }),
      value: bucketTotal(start, end),
      start,
      end,
    });
    start = end;
  }
  const first = outflows.reduce<Date | null>((earliest, item) => !earliest || item.date < earliest ? item.date : earliest, null);
  const last = outflows.reduce<Date | null>((latest, item) => !latest || item.date > latest ? item.date : latest, null);
  const monthCount = first && last ? (last.getFullYear() - first.getFullYear()) * 12 + last.getMonth() - first.getMonth() + 1 : 0;
  const weekCount = first && last ? weeks.filter((week) => week.end > first && week.start <= last).length : 0;
  const total = outflows.reduce((sum, item) => sum - item.amount, 0);
  return {
    months,
    weeks,
    averageMonth: monthCount ? total / monthCount : 0,
    averageWeek: weekCount ? total / weekCount : 0,
    coverageDays: first && last ? Math.max(1, Math.round((new Date(last.getFullYear(), last.getMonth(), last.getDate()).getTime() - new Date(first.getFullYear(), first.getMonth(), first.getDate()).getTime()) / 86400000) + 1) : 1,
  };
}

export function summarize(transactions: Transaction[], period: Period, anchor: Date) {
  const { start, end, days } = periodBounds(period, anchor);
  const current = transactions.filter((item) => item.date >= start && item.date < end);
  const outflows = current.filter((item) => item.amount < 0);
  const expenses = outflows.filter((item) => !item.isTransfer);
  const transfers = outflows.filter((item) => item.isTransfer);
  const total = expenses.reduce((sum, item) => sum - item.amount, 0);
  const transferTotal = transfers.reduce((sum, item) => sum - item.amount, 0);
  const outflowTotal = total + transferTotal;
  const categories = groupExpensesByCategory(expenses);
  const outflowCategories = groupExpensesByCategory(outflows);
  const daily = period === "year" ? [] : Array.from({ length: days }, (_, index) => {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index);
    const value = outflows.filter((item) => item.date.toDateString() === date.toDateString()).reduce((sum, item) => sum - item.amount, 0);
    return { label: date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" }), value };
  });
  const recipients = Array.from(transfers.reduce((groups, item) => {
    const name = item.description.replace(/^(перевод|transfer|сбп)\s*(по номеру телефона|клиенту|на карту|:|—|-)?\s*/i, "").trim() || item.message || "Получатель не указан";
    const previous = groups.get(name) ?? { name, value: 0, count: 0 };
    groups.set(name, { name, value: previous.value - item.amount, count: previous.count + 1 });
    return groups;
  }, new Map<string, { name: string; value: number; count: number }>())).map(([, value]) => value).sort((a, b) => b.value - a.value);
  return { start, end, days, current, outflows, expenses, transfers, total, transferTotal, outflowTotal, categories, outflowCategories, daily, recipients };
}
