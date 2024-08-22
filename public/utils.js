const START_DATE = new Date(2024, 7, 22, 0, 0);

const END_DATE = new Date(2024, 8, 22, 0, 0);

class Day {
  constructor(date) {
    this.date = date;
  }

  getTimestamp() {
    return +this.date;
  }
  getDay() {
    return this.date.getDate();
  }

  getWeekDay() {
    const weekDayName = this.date.toLocaleDateString('en-EN', { weekday: 'long' });
    const [firstLetter, ...restLetters] = weekDayName;

    return `${firstLetter.toUpperCase()}${restLetters.join('')}`;
  }

  isToday() {
    return this.getDay() === new Date().getDate();
  }
}
const generateMonth = () => {
  const START_DATE = new Date(2024, 7, 22, 0, 0);

  const END_DATE = new Date(2024, 8, 22, 0, 0);

  let current = START_DATE;
  let days = [];

  while (current.getTime() < END_DATE.getTime()) {
    days.push(new Day(new Date(current)));
    current.setDate(current.getDate() + 1);
  }
  return days;
};

const isMobile = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
