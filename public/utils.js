const generateMonth = () => Array.from({ length: 31 }, (_, i) => i).slice(1);

const isMobile = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

const getWeekDay = (date) => {
  const weekDayName = date.toLocaleDateString('ru-RU', { weekday: 'short' });
  const [firstLetter, ...restLetters] = weekDayName;

  return `${firstLetter.toUpperCase()}${restLetters.join('')}`;
};

const getDate = ({ month, year, day }) => {
  return new Date(year, month, day);
};
