export function endOfMonth(myDate) {
  let date = new Date(myDate);
  date.setDate(1); // Avoids edge cases on the 31st day of some months
  date.setMonth(date.getMonth() + 1);
  date.setDate(0);
  date.setHours(23);
  date.setMinutes(59);
  date.setSeconds(59);
  return date;
}
