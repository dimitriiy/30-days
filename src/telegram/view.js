export function getInfoStat({ today, daysInMonth, id, tasks }) {
  const icons = {
    done: '✅',
    fail: '❌',
    base: '🗓️',
    today: '📍',
  };

  const stat = Array.from({ length: daysInMonth }).map((_, i) => {
    const day = i + 1;

    if (today === day) {
      return icons.today;
    }
    if (tasks[day]) {
      return tasks[day].includes(id) ? icons.done : icons.fail;
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
