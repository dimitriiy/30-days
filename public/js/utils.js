const generateMonth = ({ year, month, start }) => {
  const days = [];
  let date = new Date(year, month, start ?? 1);
  date.toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });

  while (date.getMonth() === month) {
    days.push({
      date: new Date(date),
      day: date.getDate(),
      name: date.toLocaleDateString('ru-RU', { weekday: 'long' }),
    });
    date.setDate(date.getDate() + 1);
  }

  return days;
};

const getWeekDay = (weekName, isShort) => {
  const [firstLetter, ...restLetters] = weekName;

  const value = `${firstLetter.toUpperCase()}${restLetters.join('')}`;

  if (isShort) return value.slice(0, 2);

  return value;
};

const getNameOfMonth = () => {
  let date = new Date();
  date.toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });

  return date.toLocaleString('ru-RU', { month: 'long' });
};

const getPluralDay = (day) => {
  if (day === 2) return 'дня';

  const rtf1 = new Intl.RelativeTimeFormat('ru-RU', { numeric: 'auto' });
  const parts = rtf1.formatToParts(day, 'days');

  return parts?.[2]?.value ?? 'день';
};

const classes = (...args) => {
  return args.reduce((acc, c) => {
    if (typeof c === 'string') {
      acc += c;
    }

    if (typeof c === 'object') {
      const valid = Object.keys(c).filter((k) => c[k]);

      acc += ' ' + valid.join(' ');
    }

    return acc;
  }, '');
};
