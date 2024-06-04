const getBadge = ({ day, tasks, users }) => {
  const today = new Date().getDate();
  const isToday = today === day;
  const isDone = tasks[day]?.length === users.length ?? false;
  const isPastDay = day < today;

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

const createActionButtons = ({ users, tasks, day }) => {
  const getDoneStatus = (u) => tasks[day]?.includes(u.id);
  const actionsBtn = users.map(
    (user) => ` <label class="inline-flex items-center cursor-pointer">
        <div class="toggle-btn ${getDoneStatus(user) ? 'toggle-btn--done' : ''} ${user.id !== Auth.getCurrentUser()?.id ? 'toggle-btn--disabled' : ''}" data-user='${JSON.stringify(
          {
            id: user.id,
            day,
          }
        )}' >
            <div class="icon">
              <i class="fa-regular ${getDoneStatus(user) ? 'fa-circle-check' : 'fa-circle-xmark'}"></i>
            </div>
          </div>
           <span class="ms-1 text-sm font-medium text-white ">${user.name}</span>

    </label>`
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
        src="img/abs_six_pack${day < 6 ? '_start' : ' (' + (30 - day) + ')'}.svg"

      />`,
  };

  return icons[type];
};
const createCard = ({ day, users, tasks }) => {
  const tday = new Date().getDate();
  const isDone = tasks[day]?.length === users.length ?? false;

  const isToday = new Date().getDate() === day;
  const today = getBadge({ day, tasks, users });

  const isPastDay = day < tday;

  const pic = {
    done: `<span style="color:#fff; font-size: 140px">${getIconByStatus('done')}</i></span>`,
    fail: `<span style="color:#fff; font-size: 140px">${getIconByStatus('fail')}</span>`,
    base: `<img
        width="150"
        height="150"
        src="img/abs_six_pack${day < 6 ? '_start' : ' (' + (30 - day) + ')'}.svg"
      />`,
  };
  const picType = isPastDay ? (isDone ? 'done' : 'fail') : 'base';
  const mainPic = pic[picType];

  const timer = isToday ? `<div class="today-timer"></div>` : '';
  return `
<div class="card ${isToday ? 'card--active' : ''} ${isPastDay ? 'card--past' : ''} ${isPastDay && isDone ? 'card--done' : ''}">
  <div class="card__body">
     ${today}
     

    <div 
    tabindex="0"
     class="card__front "
    >
         ${timer}
    <div class="card__content">
 
      
      
      ${mainPic}
       <p class="absolute top-4 right-4 text-l text-white">${getWeekDay(getDate({ year: 2024, month: 3, day }))}</p>

      <p class="absolute bottom-4 right-4 text-xl font-bold text-white">${day}</p>
</div>
    </div>
    <div class="card__back">
    <div class="task-actions" onclick="window.event.cancelBubble = true;">
      ${createActionButtons({ users, tasks, day })}
</div>
</div>
  </div>    


</div>
`;
};

function createMinCard({ day, users, tasks }) {
  const today = new Date().getDate();
  const isToday = today === day;
  const isDone = tasks[day]?.length === users.length ?? false;
  const isPastDay = day < today;

  const picType = isPastDay ? (isDone ? 'done' : 'fail') : 'base';
  const todayBadge = isToday
    ? `<div class=" font-bold tracking-tighter  today">
          Сегодня
        </div>`
    : '';

  return `<div class="table-cards__item ${isDone && isPastDay ? 'table-cards__item--done' : ''} ${isToday ? 'table-cards__item--today animate__animated animate__pulse animate__infinite infinite' : ''}">   

        ${todayBadge}
    <span class="table-cards__item-pic">${getIconByStatus(picType, day)}</span>
<span class="table-cards__day">${day}</span></div>`;
}
function generateTableCards({ users, tasks }) {
  const cards = generateMonth()
    .map((i) => createMinCard({ day: i, users, tasks }))
    .join('');

  return `<div class="table-cards">${cards}</div>`;
}
