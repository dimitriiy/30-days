export function getInfoStat({ today, daysInMonth, id, tasks }) {
  const icons = {
    done: '✅',
    fail: '❌',
    base: '🗓️',
    today: '📍',
  };

  const stat = Array.from({ length: daysInMonth + 1 }, (_, i) => i)
    .slice(2)
    .map((i) => {
      const day = i;

      if (today === day) {
        return icons.today;
      }
      if (tasks[day]) {
        return tasks[day].length === 2 ? icons.done : icons.fail;
      }

      return icons.base;
    });

  const chunks = [];

  for (let i = 0; i < stat.length / 7; i++) {
    const chunk = stat.slice(i * 7, i * 7 + 7);
    chunks.push(chunk);
  }

  const formatted = chunks.map((subArr) => subArr.join('')).join('\n');

  return formatted;
}
