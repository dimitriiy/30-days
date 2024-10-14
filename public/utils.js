const START_DATE = new Date(2024, 9, 14, 0, 0);

const END_DATE = new Date(2024, 10, 15, 0, 0);

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
    const weekDayName = this.date.toLocaleDateString('ru-Ru', { weekday: 'long' });
    const [firstLetter, ...restLetters] = weekDayName;

    return `${firstLetter.toUpperCase()}${restLetters.join('')}`;
  }

  isToday() {
    return this.getDay() === new Date().getDate();
  }
}
const generateMonth = () => {
  const START_DATE = new Date(2024, 9, 14, 0, 0);

  const END_DATE = new Date(2024, 10, 14, 0, 0);

  let current = START_DATE;
  let days = [];

  while (current.getTime() < END_DATE.getTime()) {
    days.push(new Day(new Date(current)));
    current.setDate(current.getDate() + 1);
  }
  console.log(days);
  return days;
};

const isMobile = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
