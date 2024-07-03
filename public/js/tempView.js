const pic = {
  done: `<span style="color:#fff; font-size: 140px">${getIconByStatus('done')}</i></span>`,
  fail: `<span style="color:#fff; font-size: 140px">${getIconByStatus('fail')}</span>`,
  base: `<img
        width="150"
        height="150"
        src="../img/books.svg"
      />`,
};

class Card {
  render({ day, users, tasks }) {
    const toda = new Date().getDate();
    const isDone = tasks[day.day]?.length === users.length ?? false;
    const isToday = new Date().getDate() === day.day;
    const today = getBadge({ day: day.day, tasks, users });
    const isPastDay = day.day < todah;

    const picType = isPastDay ? (isDone ? 'done' : 'fail') : 'base';
    const mainPic = pic[picType];

    const timer = isToday ? `<div class="today-timer"></div>` : '';

    const rootClass = classes('card', {
      'card--active': isToday,
      'card--past': isPastDay,
      'card--done': isPastDay && isDone,
    });

    return `
        <div class="${rootClass}">
          <div class="card__body">
              ${today}
              <div tabindex="0" class="card__front">${timer}
                  <div class="card__content">
                      ${mainPic}
                      <p class="absolute top-4 right-4 text-l text-white">${getWeekDay(day.name, true)}</p>
                      <p class="absolute bottom-4 right-4 text-xl font-bold text-white">${day.day}</p>
                  </div>
              </div>
              <div class="card__back">
                  <div class="task-actions" onclick="window.event.cancelBubble = true;">
                      ${createActionButtons({ users, tasks, day: day.day })}
                  </div>
              </div>
          </div>
      </div>
    `;
  }
}
