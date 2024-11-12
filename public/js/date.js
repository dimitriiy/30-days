export class DateUtils {
  static isDateBeforeToday(a, b) {
    return new Date(a.toDateString()) < new Date(b.toDateString());
  }
}
