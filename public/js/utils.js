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
export const generateMonth = ({ startDate, endDate }) => {
  let current = new Date(startDate);
  let days = [];

  while (current.getTime() < new Date(endDate).getTime()) {
    days.push(new Day(new Date(current)));
    current.setDate(current.getDate() + 1);
  }
  return days;
};

const isMobile = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

export function startTimers({ endDate }) {
  setInterval(() => {
    const now = new Date();
    const h = 23 - now.getHours();
    const m = 59 - now.getMinutes();
    const s = 59 - now.getSeconds();

    let hh = h < 10 ? '0' + h : h;
    let mm = m < 10 ? '0' + m : m;
    let ss = s < 10 ? '0' + s : s;

    const value = `${hh}:${mm}:${ss}`;
    $('.today-timer').text(value);
  }, 1000);

  new FlipDown(+new Date(endDate) / 1000, 'main-countdown').start();
}

export const createTimer = (startDate, endDate) => {
  const t1 = new Date().getTime();
  const t2 = new Date(endDate).getTime();

  return Math.floor((t2 - t1) / (24 * 3600 * 1000));
};
