import type { Transaction } from "./model";

function safeCategory(item: Transaction): string {
  if (item.isTransfer) return "Переводы";
  const category = item.category.trim().replace(/\s+/g, " ");
  if (!category || /^[=+@\-]/.test(category)) return "Другое";
  if (/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(category)) return "Другое";
  if (/(?:\d[\s-]*){10,19}/.test(category)) return "Другое";
  return category;
}

function csvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

/** Exclude operation descriptions and messages, which often contain personal data. */
export function createAnonymousFinanceCsv(transactions: Transaction[]): string {
  const rows = transactions.map((item) => {
    const date = `${item.date.getFullYear()}-${String(item.date.getMonth() + 1).padStart(2, "0")}-${String(item.date.getDate()).padStart(2, "0")}`;
    const currency = /^[A-Z]{3}$/.test(item.currency) ? item.currency : "UNKNOWN";
    return [date, String(item.amount), currency, item.isTransfer ? "transfer" : "purchase", csvCell(safeCategory(item))].join(",");
  });
  return ["date,amount,currency,type,category", ...rows].join("\n");
}
