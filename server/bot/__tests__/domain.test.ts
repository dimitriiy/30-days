import assert from "node:assert/strict";
import test from "node:test";

import { dayNumber, dueNotifications, habitDay, isActiveHabit, localDateTime, nextDate, parseTime, parseTimeZone, progress, quoteTime, type Habit, type Subscriber } from "../domain";

function habit(startDate = "2026-01-01"): Habit {
  return { id: "one", title: "Читать", startDate, reminderTime: "10:00", checkTime: "21:00", results: {} };
}

test("accepts only valid 24-hour times", () => {
  assert.equal(parseTime("8:05"), "08:05");
  assert.equal(parseTime("23:59"), "23:59");
  assert.equal(parseTime("24:00"), null);
  assert.equal(parseTime("09:60"), null);
  assert.equal(parseTime("tomorrow"), null);
});

test("uses each subscriber's local date and time across midnight", () => {
  const now = new Date("2026-06-01T21:15:00Z");
  assert.deepEqual(localDateTime(now, "Europe/Moscow"), { date: "2026-06-02", time: "00:15" });
  assert.deepEqual(localDateTime(now, "America/New_York"), { date: "2026-06-01", time: "17:15" });
});

test("accepts named time zones and follows daylight saving time", () => {
  assert.equal(parseTimeZone("Москва"), "Europe/Moscow");
  assert.equal(parseTimeZone("Europe/Berlin"), "Europe/Berlin");
  assert.equal(parseTimeZone("Invalid/Somewhere"), null);
  assert.equal(localDateTime(new Date("2026-01-15T08:00:00Z"), "Europe/Berlin").time, "09:00");
  assert.equal(localDateTime(new Date("2026-07-15T08:00:00Z"), "Europe/Berlin").time, "10:00");
});

test("same morning time is due at different UTC instants for different users", () => {
  const moscow: Subscriber = { chatId: 1, active: true, timeZone: "Europe/Moscow", morningTime: "08:00", habits: [] };
  const berlin: Subscriber = { chatId: 2, active: true, timeZone: "Europe/Berlin", morningTime: "08:00", habits: [] };
  const moscowLocal = localDateTime(new Date("2026-06-01T05:00:00Z"), moscow.timeZone!);
  const berlinAtSameInstant = localDateTime(new Date("2026-06-01T05:00:00Z"), berlin.timeZone!);
  assert.equal(dueNotifications(moscow, moscowLocal.date, moscowLocal.time).morning, true);
  assert.equal(dueNotifications(berlin, berlinAtSameInstant.date, berlinAtSameInstant.time).morning, false);
  const berlinLocal = localDateTime(new Date("2026-06-01T06:00:00Z"), berlin.timeZone!);
  assert.equal(dueNotifications(berlin, berlinLocal.date, berlinLocal.time).morning, true);
});

test("nonexistent local time on spring DST day is delivered after the clock jump", () => {
  const user: Subscriber = { chatId: 1, active: true, timeZone: "Europe/Berlin", morningTime: "02:30", habits: [habit("2026-03-29")] };
  user.habits[0].reminderTime = "02:30";
  const now = new Date("2026-03-29T01:00:00Z");
  const current = localDateTime(now, user.timeZone!);
  const previous = localDateTime(new Date(now.getTime() - 60_000), user.timeZone!);
  assert.deepEqual(current, { date: "2026-03-29", time: "03:00" });
  assert.equal(previous.time, "01:59");
  const due = dueNotifications(user, current.date, current.time, previous.time);
  assert.equal(due.morning, true);
  assert.deepEqual(due.reminders, ["one"]);
});

test("repeated local hour on autumn DST day does not duplicate a sent message", () => {
  const user: Subscriber = { chatId: 1, active: true, timeZone: "Europe/Berlin", morningTime: "02:30", habits: [] };
  const first = localDateTime(new Date("2026-10-25T00:30:00Z"), user.timeZone!);
  const second = localDateTime(new Date("2026-10-25T01:30:00Z"), user.timeZone!);
  assert.deepEqual(first, second);
  assert.equal(dueNotifications(user, first.date, first.time).morning, true);
  user.lastMorningDate = first.date;
  assert.equal(dueNotifications(user, second.date, second.time).morning, false);
});

test("daily quote minute is stable and inside 12:00–21:00", () => {
  const first = quoteTime(12345, "2026-06-01");
  assert.equal(first, quoteTime(12345, "2026-06-01"));
  assert.ok(first >= "12:00" && first < "21:00");
});

test("habit lasts exactly 30 calendar days, including leap day", () => {
  const item = habit("2028-02-28");
  assert.equal(habitDay(item, "2028-02-29"), 2);
  assert.equal(dayNumber("2028-02-29") - dayNumber("2028-02-28"), 1);
  assert.equal(isActiveHabit(item, "2028-03-28"), true);
  assert.equal(isActiveHabit(item, "2028-03-29"), false);
  assert.equal(nextDate("2028-02-28"), "2028-02-29");
});

test("notifications are due once per day at their chosen times", () => {
  const user: Subscriber = { chatId: 12345, active: true, morningTime: "08:00", habits: [habit()] };
  const date = "2026-01-01";
  assert.equal(dueNotifications(user, date, "08:00").morning, true);
  user.lastMorningDate = date;
  assert.equal(dueNotifications(user, date, "08:00").morning, false);
  assert.deepEqual(dueNotifications(user, date, "10:00").reminders, ["one"]);
  user.habits[0].lastReminderDate = date;
  assert.deepEqual(dueNotifications(user, date, "10:00").reminders, []);
  assert.deepEqual(dueNotifications(user, date, "21:00").checks, ["one"]);
  user.habits[0].results[date] = true;
  assert.deepEqual(dueNotifications(user, date, "21:00").checks, []);
  const quote = quoteTime(user.chatId, date);
  assert.equal(dueNotifications(user, date, quote).quote, true);
  user.lastQuoteDate = date;
  assert.equal(dueNotifications(user, date, quote).quote, false);
  user.active = false;
  assert.deepEqual(dueNotifications(user, date, quote), { morning: false, quote: false, reminders: [], checks: [] });
});

test("habit check is still due later on the same day after a missed delivery window", () => {
  const user: Subscriber = { chatId: 1, active: true, habits: [habit()] };
  user.habits[0].checkTime = "22:00";
  assert.deepEqual(dueNotifications(user, "2026-01-01", "21:59").checks, []);
  assert.deepEqual(dueNotifications(user, "2026-01-01", "22:45").checks, ["one"]);
  user.habits[0].lastCheckDate = "2026-01-01";
  assert.deepEqual(dueNotifications(user, "2026-01-01", "23:59").checks, []);
});

test("progress separates completed, skipped and unanswered days", () => {
  const item = habit();
  item.results["2026-01-01"] = true;
  item.results["2026-01-02"] = false;
  assert.deepEqual(progress(item, "2026-01-04"), { elapsed: 4, done: 1, missed: 1, unanswered: 2 });
  assert.deepEqual(progress(item, "2025-12-31"), { elapsed: 0, done: 0, missed: 0, unanswered: 0 });
  assert.equal(progress(item, "2026-03-01").elapsed, 30);
});
