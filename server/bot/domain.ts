export const HABIT_DAYS = 30;
export const DEFAULT_TIME_ZONE = "Europe/Moscow";

export interface Habit {
  id: string;
  title: string;
  startDate: string;
  reminderTime: string;
  checkTime: string;
  results: Record<string, boolean>;
  lastReminderDate?: string;
  lastCheckDate?: string;
}

export interface Subscriber {
  chatId: number;
  active: boolean;
  firstName?: string;
  timeZone?: string;
  morningTime?: string;
  awaiting?: "timezone" | "morning" | "habit-title" | "habit-reminder" | "habit-check";
  draft?: { title: string; reminderTime?: string };
  pendingHabitDeletion?: { ids: string[]; requestedAt: string; token: string };
  habits: Habit[];
  lastMorningDate?: string;
  lastQuoteDate?: string;
}

export interface BotData {
  subscribers: Subscriber[];
}

export function parseTime(value: string): string | null {
  const match = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(value.trim());
  if (!match) return null;
  return `${match[1].padStart(2, "0")}:${match[2]}`;
}

const TIME_ZONE_ALIASES: Record<string, string> = {
  "москва": "Europe/Moscow",
  "санкт-петербург": "Europe/Moscow",
  "калининград": "Europe/Kaliningrad",
  "екатеринбург": "Asia/Yekaterinburg",
  "новосибирск": "Asia/Novosibirsk",
  "красноярск": "Asia/Krasnoyarsk",
  "иркутск": "Asia/Irkutsk",
  "владивосток": "Asia/Vladivostok",
};

export function parseTimeZone(value: string): string | null {
  const candidate = TIME_ZONE_ALIASES[value.trim().toLowerCase()] ?? value.trim();
  if (!candidate) return null;
  try {
    return new Intl.DateTimeFormat("en", { timeZone: candidate }).resolvedOptions().timeZone;
  } catch {
    return null;
  }
}

export function localDateTime(now: Date, timeZone: string): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(now);
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? "";
  return { date: `${part("year")}-${part("month")}-${part("day")}`, time: `${part("hour")}:${part("minute")}` };
}

export function dayNumber(date: string): number {
  return Math.floor(Date.parse(`${date}T00:00:00Z`) / 86_400_000);
}

export function nextDate(date: string): string {
  return new Date((dayNumber(date) + 1) * 86_400_000).toISOString().slice(0, 10);
}

export function habitDay(habit: Habit, date: string): number {
  return dayNumber(date) - dayNumber(habit.startDate) + 1;
}

export function isActiveHabit(habit: Habit, date: string): boolean {
  const day = habitDay(habit, date);
  return day >= 1 && day <= HABIT_DAYS;
}

// Stable per user and date, so a restart does not change today's delivery minute.
export function dailyIndex(chatId: number, date: string, count: number, salt: string): number {
  let hash = 2166136261;
  for (const char of `${chatId}:${date}:${salt}`) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % count;
}

export function quoteTime(chatId: number, date: string): string {
  const minute = 12 * 60 + dailyIndex(chatId, date, 9 * 60, "quote-time");
  return `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
}

export function dueNotifications(subscriber: Subscriber, date: string, time: string, previousTime?: string): {
  morning: boolean;
  quote: boolean;
  reminders: string[];
  checks: string[];
} {
  if (!subscriber.active) return { morning: false, quote: false, reminders: [], checks: [] };
  const habits = subscriber.habits.filter((habit) => isActiveHabit(habit, date));
  const minutes = (value: string): number => Number(value.slice(0, 2)) * 60 + Number(value.slice(3));
  const isDue = (target: string): boolean => {
    const delay = minutes(time) - minutes(target);
    return (delay >= 0 && delay <= 30) || Boolean(previousTime && previousTime < target && target < time);
  };
  return {
    morning: Boolean(subscriber.morningTime && isDue(subscriber.morningTime)) && subscriber.lastMorningDate !== date,
    quote: Boolean(subscriber.morningTime) && time < "21:00" && isDue(quoteTime(subscriber.chatId, date)) && subscriber.lastQuoteDate !== date,
    reminders: habits.filter((habit) => isDue(habit.reminderTime) && time < habit.checkTime && habit.lastReminderDate !== date).map((habit) => habit.id),
    checks: habits.filter((habit) => isDue(habit.checkTime) && habit.lastCheckDate !== date && habit.results[date] === undefined).map((habit) => habit.id),
  };
}

export function progress(habit: Habit, date: string): { elapsed: number; done: number; missed: number; unanswered: number } {
  const elapsed = Math.max(0, Math.min(HABIT_DAYS, habitDay(habit, date)));
  let done = 0;
  let missed = 0;
  for (let offset = 0; offset < elapsed; offset++) {
    const day = new Date((dayNumber(habit.startDate) + offset) * 86_400_000).toISOString().slice(0, 10);
    if (habit.results[day] === true) done++;
    if (habit.results[day] === false) missed++;
  }
  return { elapsed, done, missed, unanswered: elapsed - done - missed };
}
