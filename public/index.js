const createTimer = () => {
  const now = new Date().getDate();

  return 30 - now;
};

const USER_KEY = 'user';

function updateUserView(name) {
  $('#name').html(name);
}
function handleFlip(evt) {
  console.log(evt.target);
  // if (!$(evt.target).hasClass('task-actions')) return;

  $(this).find('.card__front').toggleClass('flipped');
  $(this).find('.card__back').toggleClass('flipped');
  $(this).find('.today').toggleClass('flipped');
}

class Store {
  users = {};
  tasks = {};

  async loadUsers() {
    const users = await Api.getUsers();
    this.users = users.reduce(
      (acc, user) => ({
        ...acc,
        [user.id]: user,
      }),
      {}
    );
  }

  async loadTasks() {
    this.tasks = await Api.getTasks();
  }

  async updateTask({ day, isDone }) {
    const resp = await Api.updateTask({ id: Auth.getCurrentUser().id, day, isDone });

    return resp.result ? isDone : null;
  }
}

const store = new Store();
function authModalHandler(e) {
  const userId = e.target.dataset.user;

  if (!store.users[userId]) return;

  Auth.setUser(store.users[userId]);

  localStorage.setItem(USER_KEY, JSON.stringify(store.users[userId]));

  $.modal.close();

  updateUserView(Auth.getCurrentUser().name);
}

async function showLoader() {
  return new Promise((res) => {
    setTimeout(() => {
      $('.loader').remove();
      res();
    }, 2000);
  });
}

async function auth() {
  $('.user-list button span').click(authModalHandler);

  return new Promise((res) => {
    $('#sticky').on($.modal.AFTER_CLOSE, () => res());
  });
}

function showTableCardView() {
  $('#table-cards-modal .content').html(generateTableCards({ users: Object.values(store.users), tasks: store.tasks }));

  $('#table-cards-modal').modal({
    fadeDuration: 300,
    fadeDelay: 0.5,
  });
}

function startDayTimer() {
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
}

function scrollToToday() {
  const scrollToEl = $('.card--active');

  $('html').animate(
    {
      scrollTop: scrollToEl.offset().top - 100,
    },
    800 //speed
  );
}

function showFireworks() {
  const container = document.querySelector('.fireworks');
  const fireworks = new Fireworks.default(container);
  fireworks.start();

  return new Promise((res) => {
    setTimeout(() => {
      fireworks.stop();
      fireworks.clear();
      $('.fireworks canvas').remove();

      res();
    }, 3000);
  });
}
async function app() {
  await Promise.all([store.loadUsers(), store.loadTasks()]);
  await showLoader();

  if (!localStorage.getItem(USER_KEY)) {
    $('#sticky').modal({
      escapeClose: false,
      clickClose: false,
      showClose: false,
      fadeDuration: 300,
      fadeDelay: 0.5,
    });
    await auth();
  }
  Auth.setUser(JSON.parse(localStorage.getItem(USER_KEY)));

  updateUserView(Auth.getCurrentUser().name);
  const cards = generateMonth()
    .map((i) => createCard({ day: i, users: Object.values(store.users), tasks: store.tasks }))
    .join('');

  $('#cards').html(cards);

  $('.timer span').html(createTimer());

  $('.card.card--active').click(handleFlip);

  $('.task-check').click(async function (e) {
    const { day, user } = $(this).data();
    if (user.toString() !== Auth.getCurrentUser().id) return;
    const value = !$(this).siblings('.sr-only')[0].checked;

    const data = await store.updateTask({ day, isDone: value });

    if (data === null) {
      alert('Error');
      return;
    }

    value && (await showFireworks());

    const type = data ? '#noty-success' : '#noty-fail';
    $(type).modal({
      escapeClose: false,
      clickClose: false,
      showClose: false,
      timeout: 1000,
      fadeDuration: 300,
      fadeDelay: 0.5,
    });

    setTimeout(() => {
      $.modal.close();
    }, 2000);
  });

  $('.zoom-btn').click(showTableCardView);

  $('.logo-auth ').click(function (e) {
    e.preventDefault();
    $('#sticky').modal({
      escapeClose: false,
      clickClose: false,
      showClose: false,
      fadeDuration: 300,
      fadeDelay: 0.5,
    });
    auth();
  });
  startDayTimer();

  isMobile() && scrollToToday();
}

$(document).ready(function () {
  console.log('Готов!');
  app();
});
