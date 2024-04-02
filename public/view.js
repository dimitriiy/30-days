const getBadge = ({ day, tasks, users }) => {
  const today = new Date().getDay();
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
    return `<div class=" font-bold tracking-tighter  today" style="font-size: 30px;color:#dc2625">
          <i class="fa-solid fa-xmark"></i>
        </div>`;
  }

  return '';
};

const createActionButtons = ({ users, tasks, day }) => {
  const getDoneStatus = (u) => tasks[day]?.includes(u.id);
  const actionsBtn = users.map(
    (user) => ` <label class="inline-flex items-center cursor-pointer">
           <input type="checkbox" value="" ${getDoneStatus(user) && 'checked'} class="sr-only peer" ${user.id !== Auth.getCurrentUser()?.id && 'disabled="true"'}">
            <div data-user="${user.id}" data-day="${day}" class="task-check relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer  peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
             <span class="ms-3">  &#128170;</span>
           <span class="ms-1 text-sm font-medium text-white ">${user.name}</span>
        

    </label>`
  );

  return actionsBtn.join('');
};

const createCard = ({ day, users, tasks }) => {
  const tday = new Date().getDay();
  const isDone = tasks[day]?.length === users.length ?? false;

  const isToday = new Date().getDay() === day;
  const today = getBadge({ day, tasks, users });

  const isPastDay = day < tday;

  const mainPic =
    isDone && isPastDay
      ? `<span style="color:#fff; font-size: 140px"><i class="fa-regular fa-circle-check"></i></span>`
      : `<img
        width="150"
        height="150"
        src="abs-six-pack-icon.svg"
      />`;
  return `
<div class="card ${isToday ? 'card--active' : ''} ${isPastDay ? 'card--past' : ''} ${isDone ? 'card--done' : ''}">
  <div class="card__body">
     ${today}
    <div 
    tabindex="0"
     class="card__front "
    >
    <div class="card__content">
 
      
      
      ${mainPic}
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
