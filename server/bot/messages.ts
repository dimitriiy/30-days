import { dayNumber, habitDay, progress, type Habit } from "./domain";

export function morningNotification(text: string, firstName?: string): string {
  const name = firstName?.trim().replace(/\s+/g, " ");
  const greeting = name ? `Доброе утро, ${name}!` : "Доброе утро!";
  return `🌅 Утренний настрой\n\n${greeting}\n\n${text}`;
}

export function quoteNotification(text: string): string {
  return `💭 Мысль дня\n\n${text}`;
}

export function habitReminder(habit: Habit): string {
  return `🔔 Привычка на сегодня\n\n${habit.title}`;
}

export function habitCheck(habit: Habit): string {
  return `✅ Время отметить привычку\n\n${habit.title}\n\nУдалось выполнить её сегодня?`;
}

export function habitResult(habit: Habit, date: string, done: boolean): string {
  return `${done ? "☑️ Выполнено" : "❌ Не выполнено"}\n\n${habit.title}\n📅 ${date}\n\nОтвет можно изменить кнопкой ниже.`;
}

export function habitProgress(habit: Habit, date: string): string {
  const stats = progress(habit, date);
  const day = habitDay(habit, date);
  const status = day < 1 ? `Начнётся ${habit.startDate}` : day > 30 ? "30 дней завершены" : `День ${day} из 30`;
  const icons = Array.from({ length: 30 }, (_, index) => {
    const itemDate = new Date((dayNumber(habit.startDate) + index) * 86_400_000).toISOString().slice(0, 10);
    if (habit.results[itemDate] === true) return "☑️";
    if (habit.results[itemDate] === false) return "❌";
    return itemDate <= date ? "⬜" : "▫️";
  });
  const rows = [0, 1, 2].map((row) => `${String(row * 10 + 1).padStart(2, "0")}–${(row + 1) * 10}  ${icons.slice(row * 10, row * 10 + 10).join(" ")}`);
  return [
    "📊 Прогресс привычки",
    `🎯 ${habit.title}`,
    `📅 ${status}`,
    "",
    ...rows,
    "",
    `☑️ Выполнено: ${stats.done}  ·  ❌ Не выполнено: ${stats.missed}  ·  ⬜ Без ответа: ${stats.unanswered}`,
    "▫️ — будущие дни",
    "",
    `🔔 Напоминание: ${habit.reminderTime}  ·  📝 Отметка: ${habit.checkTime}`,
  ].join("\n");
}
