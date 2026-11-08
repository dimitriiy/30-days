import assert from "node:assert/strict";
import test from "node:test";
import { categorySpendingBuckets, expensesForBucket, groupExpensesByCategory, parseTransactions, periodBounds, shiftPeriod, spendingInsights, summarize, yearlyPurchaseHistory, yearlySpending, type Transaction } from "./model";
import { createAnonymousFinanceCsv } from "./ai-export";

const header = ["Дата операции", "Сумма в валюте счёта", "Валюта счёта", "Статус", "Категория по-умолчанию", "Ваша категория", "Описание", "Сообщение", "Учёт в аналитике"];

test("разбирает выписку, отделяет переводы и игнорирует неуспешные операции", () => {
  const transactions = parseTransactions([
    ["Банковская выписка"],
    header,
    ["08.11.2026 11:23:12", "-1 199,00", "RUB", "Ок", "Супермаркеты", null, "Самокат", null, "Да"],
    ["08.11.2026 02:07:40", "-1495,00", "RUB", "Ок", "Такси", null, "Яндекс Такси", null, "Да"],
    ["07.11.2026 12:00:00", "-500,00", "RUB", "Ок", "Переводы", null, "Перевод Ивану", null, "Да"],
    ["07.11.2026 12:00:00", "-90,00", "RUB", "Отменена", "Такси", null, "Такси", null, "Да"],
  ]);
  assert.equal(transactions.length, 3);
  const result = summarize(transactions, "week", new Date(2026, 10, 8));
  assert.equal(result.total, 2694);
  assert.equal(result.transferTotal, 500);
  assert.equal(result.outflowTotal, 3194);
  assert.equal(result.outflows.length, 3);
  assert.equal(result.daily.reduce((sum, day) => sum + day.value, 0), 3194);
  assert.deepEqual(result.categories.map(({ name }) => name), ["Такси", "Супермаркеты"]);
  assert.equal(result.recipients[0].name, "Ивану");
});

test("месячный период включает первое число и исключает следующий месяц", () => {
  const { start, end, days } = periodBounds("month", new Date(2026, 10, 8));
  assert.equal(start.getDate(), 1);
  assert.equal(end.getMonth(), 11);
  assert.equal(days, 30);
});

test("числовая дата XLSX сохраняет местные дату и время, неверные даты пропускаются", () => {
  const transactions = parseTransactions([
    header,
    [46334.5, -100, "RUB", "Ок", "Еда", null, "Обед", null, "Да"],
    ["31.02.2026 12:00:00", -200, "RUB", "Ок", "Еда", null, "Ошибка", null, "Да"],
    ["08.11.2026 25:00:00", -300, "RUB", "Ок", "Еда", null, "Ошибка", null, "Да"],
  ]);
  assert.equal(transactions.length, 1);
  assert.equal(transactions[0].date.getHours(), 12);
  assert.equal(transactions[0].date.getFullYear(), 2026);
});

test("годовой график показывает нулевые месяцы и среднее по охвату выписки", () => {
  const expenses: Transaction[] = [
    { date: new Date(2026, 0, 10), amount: -100, currency: "RUB", category: "Еда", description: "Магазин", message: "", isTransfer: false },
    { date: new Date(2026, 2, 20), amount: -200, currency: "RUB", category: "Еда", description: "Кафе", message: "", isTransfer: false },
    { date: new Date(2026, 2, 20), amount: -500, currency: "RUB", category: "Переводы", description: "Перевод", message: "", isTransfer: true },
  ];
  const summary = summarize(expenses, "year", new Date(2026, 7, 1));
  const spending = yearlySpending(summary.outflows, 2026);
  assert.equal(summary.total, 300);
  assert.equal(summary.outflowTotal, 800);
  assert.deepEqual(spending.months.map((month) => month.value), [100, 0, 700, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  assert.equal(spending.averageMonth, 800 / 3);
  assert.equal(spending.weeks.reduce((sum, week) => sum + week.value, 0), 800);
  assert.ok(Math.abs(spending.averageWeek - 800 / 11) < 0.001);
  const march = expensesForBucket(summary.outflows, spending.months[2]);
  assert.equal(march.length, 2);
  assert.deepEqual(groupExpensesByCategory(march), [{ name: "Переводы", value: 500 }, { name: "Еда", value: 200 }]);
  assert.equal(shiftPeriod(new Date(2026, 7, 1), "year", -1).getFullYear(), 2025);
});

test("категории суммируются по периодам, мелкие расходы и переводы разделены", () => {
  const expenses: Transaction[] = ["Еда", "Такси", "Дом", "Связь", "Здоровье", "Книги", "Переводы"].map((category, index) => ({
    date: new Date(2026, 0, 1), amount: -(700 - index * 100), currency: "RUB", category,
    description: category, message: "", isTransfer: category === "Переводы",
  }));
  const buckets = [{ label: "Янв", start: new Date(2026, 0, 1), end: new Date(2026, 1, 1) }, { label: "Фев", start: new Date(2026, 1, 1), end: new Date(2026, 2, 1) }];
  const result = categorySpendingBuckets(expenses, buckets);
  assert.deepEqual(result.names, ["Еда", "Такси", "Дом", "Связь", "Здоровье", "Остальное", "Переводы"]);
  assert.equal(result.data[0].category5, 200);
  assert.equal(result.data[0].category6, 100);
  assert.equal(result.data[1].category0, undefined);
});

test("итоги группируют все уникальные траты по категориям и сортируют по сумме", () => {
  const expenses: Transaction[] = [
    { date: new Date(2026, 0, 1), amount: -100, currency: "RUB", category: "Еда", description: "Кафе", message: "", isTransfer: false },
    { date: new Date(2026, 0, 2), amount: -200, currency: "RUB", category: "Еда", description: " кафе ", message: "", isTransfer: false },
    { date: new Date(2026, 0, 2), amount: -50, currency: "RUB", category: "Еда", description: "Булочная", message: "", isTransfer: false },
    { date: new Date(2026, 0, 2), amount: -400, currency: "RUB", category: "Транспорт", description: "Кафе", message: "", isTransfer: false },
    { date: new Date(2026, 0, 2), amount: -20, currency: "RUB", category: "Транспорт", description: "Метро", message: "", isTransfer: false },
    { date: new Date(2026, 0, 2), amount: 100, currency: "RUB", category: "Еда", description: "Возврат", message: "", isTransfer: false },
    { date: new Date(2026, 0, 2), amount: -500, currency: "RUB", category: "Переводы", description: "Перевод Ивану", message: "", isTransfer: true },
  ];
  const result = spendingInsights(expenses);
  assert.deepEqual(result.topCategory, { name: "Транспорт", value: 420 });
  assert.deepEqual(result.categories, [
    { name: "Транспорт", value: 420, items: [{ name: "Кафе", value: 400, count: 1 }, { name: "Метро", value: 20, count: 1 }] },
    { name: "Еда", value: 350, items: [{ name: "Кафе", value: 300, count: 2 }, { name: "Булочная", value: 50, count: 1 }] },
  ]);
  assert.equal(result.total, 770);
});

test("график траты включает все её покупки за год независимо от выбранного периода", () => {
  const base: Transaction = { date: new Date(2026, 0, 2), amount: -100, currency: "RUB", category: "Еда", description: "Самокат", message: "", isTransfer: false };
  const transactions = [
    { ...base, date: new Date(2026, 11, 2), amount: -200 },
    { ...base, description: " самокат  ", date: new Date(2026, 1, 2) },
    { ...base, category: "Транспорт" },
    { ...base, date: new Date(2025, 11, 2) },
    { ...base, isTransfer: true },
    { ...base, amount: 100 },
  ];
  const history = yearlyPurchaseHistory(transactions, "Еда", "Самокат", 2026);
  assert.deepEqual(history.map((item) => item.amount), [-100, -200]);
  assert.deepEqual(history.map((item) => item.date.getMonth()), [1, 11]);
});

test("экспорт для ИИ не содержит свободный текст и личные данные", () => {
  const transactions: Transaction[] = [{
    date: new Date(2026, 0, 2), amount: -500, currency: "RUB",
    category: "Иван +7 999 111-22-33", description: "Карта 1234 5678 9012 3456",
    message: "Иван Петров", isTransfer: true,
  }];
  const csv = createAnonymousFinanceCsv(transactions);
  assert.equal(csv, 'date,amount,currency,type,category\n2026-01-02,-500,RUB,transfer,"Переводы"');
  assert.doesNotMatch(csv, /Иван|Петров|999|1234/);
});

test("экспорт сохраняет обычные категории и скрывает номера в названиях", () => {
  const base: Transaction = { date: new Date(2026, 0, 2), amount: -100, currency: "RUB", category: "Супермаркеты", description: "Секретное описание", message: "", isTransfer: false };
  const csv = createAnonymousFinanceCsv([base, { ...base, category: "Карта 1234 5678 9012 3456", amount: -200 }]);
  assert.match(csv, /"Супермаркеты"/);
  assert.match(csv, /"Другое"/);
  assert.doesNotMatch(csv, /Секретное|1234/);
});
