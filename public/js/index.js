import { createTimer, generateMonth, startDayTimer } from './utils.js';
import { Api, Auth } from './api.js';
import { createCard, generateTableCards } from './view.js';
import { store } from './store.js';
import { DateUtils } from './date.js';
const USER_KEY = 'user';

function updateUserView(name) {
  $('#name').html(name);
}
function handleFlip(evt) {
  console.log(evt.target);

  $(this).find('.card__front').toggleClass('flipped');
  $(this).find('.card__back').toggleClass('flipped');
  $(this).find('.today').toggleClass('flipped');
}

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
    }, 200);
  });
}

async function auth() {
  $('.user-list button span').click(authModalHandler);

  const savedCurrentUser = localStorage.getItem(USER_KEY);
  if (savedCurrentUser) {
    try {
      Auth.setUser(JSON.parse(savedCurrentUser));
    } catch (e) {
      console.error(e);
    }
    return;
  }

  $('#sticky').modal({
    escapeClose: false,
    clickClose: false,
    showClose: false,
    fadeDuration: 300,
    fadeDelay: 0.5,
  });

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

function scrollToToday() {
  const scrollToEl = $('.card--active');

  $('html').animate(
    {
      scrollTop: scrollToEl.offset().top - 100,
    },
    1000 //speed
  );
}

function showFireworks() {
  $('body').append(`<div class="fireworks"></div>`);
  const container = document.querySelector('.fireworks');
  const fireworks = new Fireworks.default(container);
  fireworks.start();

  return new Promise((res) => {
    setTimeout(() => {
      fireworks.stop();
      fireworks.clear();
      $('.fireworks').remove();

      res();
    }, 5000);
  });
}

function handleTodoChange() {
  $('.toggle-btn').click(async function (e) {
    const {
      user: { id, day },
    } = $(this).data();

    if (id.toString() !== Auth.getCurrentUser().id) return;

    $(this).toggleClass('toggle-btn--done');
    const isDone = $(this).hasClass('toggle-btn--done');

    const response = await store.updateTask({ day, isDone });

    if (response === null) {
      alert('Error');
      return;
    }

    const lockIcon = $(this).find('.icon i');

    if ($(this).hasClass('toggle-btn--done')) {
      lockIcon.removeClass('fa-circle-xmark').addClass('fa-circle-check');
    } else lockIcon.removeClass('fa-circle-check').addClass('fa-circle-xmark');

    isDone && (await showFireworks());

    const type = response ? '#noty-success' : '#noty-fail';
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
}
function viewCards({ startDate, endDate }) {
  const cards = generateMonth({ startDate, endDate })
    .map((day) =>
      createCard({ day, users: Object.values(store.users), tasks: store.tasks, currentUser: Auth.getCurrentUser() })
    )
    .join('');

  $('#cards').html(cards);

  $('.card.card--active').click(handleFlip);
  $('.card.card--past').click(handleFlip);
  handleTodoChange();
}

function viewHeader({ startDate, endDate, version, dateTitle }) {
  $('.timer span').html(createTimer(startDate, endDate));
  $('.version').text(version);
  $('.date-range').text(dateTitle);
}

function showNoChallenge() {
  $('.main-content').html(
    '<h1  style="font-size: 4em" class="w-full font-bold text-center bg-gradient-to-r from-blue-600 via-green-500 to-indigo-400 inline-block text-transparent bg-clip-text">Челленж еще начался!</h1>'
  );
}

async function app() {
  await store.init();
  await showLoader();
  await auth();
  updateUserView(Auth.getCurrentUser().name);

  const {
    challengeManifest: { startDate, endDate },
  } = store;
  viewHeader(store.challengeManifest);

  const challengeHasStarted = !DateUtils.isDateBeforeToday(new Date(), new Date(startDate));

  if (!challengeHasStarted) {
    showNoChallenge();
    return;
  }

  $('#user-info').modal({
    escapeClose: false,
    clickClose: false,
    showClose: false,
    fadeDuration: 300,
    fadeDelay: 0.5,
  });

  viewCards({ startDate, endDate });

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
  scrollToToday();
}

$(document).ready(function () {
  console.log('Готов!');
  app();
});
