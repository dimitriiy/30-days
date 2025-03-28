const getBadge = ({ day, tasks, users }) => {
  const isToday = day.isToday();
  const isDone = tasks[day.getDay()]?.length === users.length ?? false;
  const isPastDay = day.getTimestamp() < +new Date();

  if (isToday) {
    return `<div class=" font-bold tracking-tighter  today">
          Сегодня
        </div>`;
  }

  if (isPastDay && isDone) {
    return `<div class=" badge-passed absolute left-[-46px] top-[12px] w-[170px] -rotate-45 transform bg-gradient-to-r from-yellow-400 to-yellow-100 py-1 font-semibold text-black drop-shadow-md">
          <span class="ml-10">Пройден!</span>
        </div>`;
  }

  if (isPastDay && !isDone) {
    return `<div class=" badge-passed absolute left-[-46px] top-[12px] w-[170px] -rotate-45 transform bg-gradient-to-r from-white to-black py-1 font-semibold text-black drop-shadow-md">
          <span class="ml-10">Фэйл!</span>
        </div>`;
  }

  return '';
};

const createActionButtons = ({ users, tasks, day, currentUser }) => {
  const getDoneStatus = (u) => tasks[day.getDay()]?.includes(u.id);
  const actionsBtn = users.map(
    (user) => ` <div class="inline-flex items-center cursor-pointer">
        <div class="toggle-btn ${getDoneStatus(user) ? 'toggle-btn--done' : ''} ${user.id !== currentUser?.id ? 'toggle-btn--disabled' : ''}" data-user='${JSON.stringify(
          {
            id: user.id,
            day: day.getDay(),
          }
        )}' >
            <div class="icon">
              <i class="fa-regular ${getDoneStatus(user) ? 'fa-circle-check' : 'fa-circle-xmark'}"></i>
            </div>
          </div>
           <span class="ms-1 text-sm font-medium color " >${user.name}</span>

    </div>`
  );

  return actionsBtn.join('');
};

const getIconByStatus = (type, day) => {
  const icons = {
    done: '<i class="fa-regular fa-circle-check"></i>',
    fail: '<i class="fa-regular fa-circle-xmark"></i></span>',
    base: `<img
        width="150"
        height="150"
        src="../img/books.svg"

      />`,
  };

  return icons[type];
};
let index = 1;

const createCountDayBlock = (idx) => {
  if (idx < 10) {
    return `<span class="first-day">${idx}</span>`;
  }

  return `<span class="first-day">${Math.floor(idx / 10)}</span><span class="second-day">${idx % 10}</span>`;
};

let i = 1;
export const createCard = ({ day, users, tasks, currentUser }) => {
  const isDone = tasks[day.getDay()]?.length === users.length ?? false;

  const isToday = day.isToday();
  const today = getBadge({ day, tasks, users });

  const isPastDay = day.getTimestamp() < +new Date() && !isToday;

  if (i > 9) {
    i = 1;
  }
  const pic = {
    done: `<span style="color:#fff; font-size: 140px">${getIconByStatus('done')}</i></span>`,
    fail: `<span style="color:#fff; font-size: 140px">${getIconByStatus('fail')}</span>`,
    base: `<img
        src="img/people/${i++}.png"
        style="height: 160px"
      />`,
  };
  const picType = isPastDay ? (isDone ? 'done' : 'fail') : 'base';
  const mainPic = pic[picType];

  const timer = isToday ? `<div class="today-timer" id="today-timer" ></div>` : '';

  const countDay = isPastDay ? '' : createCountDayBlock(index);

  return `
<div  style="animation-delay: ${(index - 1) * 0.02}s" class="card ${isToday ? 'card--active' : ''} ${isPastDay ? 'card--past' : ''} ${isPastDay && isDone ? 'card--done' : ''}">
  <div class="card__body">
     ${today}


    <div
    tabindex="0"
     class="card__front "
    >
<div class="card__fav">
<img src="../img/flame-icon.svg" alt="">
</div>
         ${timer}
    <div class="card__content">

       <div class="absolute card__count  text-l font-bold">День ${index++}</div>
      ${mainPic}
       <p class="absolute card__date text-l font-bold">${day.getWeekDay()}, ${day.getDay()}</p>

</div>
    </div>
    <div class="card__back">
    <div class="task-actions" onclick="window.event.cancelBubble = true;">
      ${createActionButtons({ users, tasks, day, currentUser })}
</div>
</div>
  </div>


</div>
`;
};

export function createMinCard({ day, users, tasks }) {
  const isToday = day.isToday();
  const isDone = tasks[day.getDay()]?.length === users.length ?? false;
  const isPastDay = day.getTimestamp() < +new Date();

  const picType = isPastDay ? (isDone ? 'done' : 'fail') : 'base';
  const todayBadge = isToday
    ? `<div class=" font-bold tracking-tighter  today">
          Сегодня
        </div>`
    : '';

  return `<div class="table-cards__item ${isDone && isPastDay ? 'table-cards__item--done' : ''} ${isToday ? 'table-cards__item--today animate__animated animate__pulse animate__infinite infinite' : ''}">   

        ${todayBadge}
    <span class="table-cards__item-pic">${getIconByStatus(picType, day.getDay())}</span>
<span class="table-cards__day">${day.getDay()}</span></div>`;
}
export function generateTableCards({ users, tasks }) {
  const cards = generateMonth()
    .map((day) => createMinCard({ day, users, tasks }))
    .join('');

  return `<div class="table-cards">${cards}</div>`;
}
