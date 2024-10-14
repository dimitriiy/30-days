import { Telegraf } from 'telegraf';
import cron from 'node-cron';
import { END_OF_DAY, SUCCESS_WEEK } from './messages.js';
import { database } from '../db.js';
import { endOfMonth } from '../../utils.js';
import { logger } from '../../logger.js';
import { getInfoStat } from './view.js';

export async function startBot() {
  try {
    const bot = new Telegraf(process.env.BOT_TOKEN);
    bot.start(async (ctx) => {
      const { id, first_name, username } = ctx.message.chat;
      await database.addChatUser({ id, first_name, username });

      ctx.reply('Ку!');
    });
    bot.on('stop', () => console.log('STOP'));

    bot.help((ctx) => ctx.reply('Send me a sticker'));
    bot.on('sticker', (ctx) => ctx.reply('👍'));
    bot.hears('hi', (ctx) => ctx.reply('Hey there'));
    bot.launch();

    // Enable graceful stop
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));

    startCron(bot);
  } catch (e) {
    console.log(e);
    logger.error('Init bot Error: ', e);
  }
}

const dailyReminder = (bot) => {
  cron.schedule('* * * * *', async () => {
    try {
      console.log('running a task every day', new Date().getDate());

      const currentDate = new Date().getDate();
      const [users, tasks, usersIds] = await Promise.all([
        database.getUsers(),
        database.getTask(),
        database.getChatIds(),
      ]);

      usersIds.forEach(({ id, first_name, username }) => {
        const currentUser = users.find(({ telegram }) => telegram === username);
        const isCurrentUserDoneToday = tasks[currentDate]?.includes(currentUser.id);

        if (!currentUser || isCurrentUserDoneToday) return;

        const name = first_name ?? username;
        bot.telegram.sendMessage(id, `${name} 🤟\n\n${END_OF_DAY}🏃🏃\n <a href="http://book.ddimedrol.ru/">Клик</a>`, {
          parse_mode: 'HTML',
        });
      });
    } catch (e) {
      console.log(e);
      logger.error('dailyReminder Error: ', e);
    }
  });
};

const successfullWeekReminder = (bot) => {
  cron.schedule('0 9 * * MON', async () => {
    try {
      console.log('running a task every day', new Date().getDate());

      const currentDate = new Date().getDate();
      const [users, tasks, usersIds] = await Promise.all([
        database.getUsers(),
        database.getTask(),
        database.getChatIds(),
      ]);

      usersIds.forEach(({ id, first_name, username }) => {
        const currentUser = users.find(({ telegram }) => telegram === username);
        const isPrevWeekDone = Array.from({ length: 7 }, (_, i) => currentDate - i - 1).every((i) =>
          tasks[i]?.includes(currentUser.id)
        );
        console.log({ isPrevWeekDone });

        if (!currentUser || !isPrevWeekDone) return;

        const name = first_name ?? username;
        bot.telegram.sendMessage(id, `${name} 🤟\n\n${SUCCESS_WEEK}\n 🔥🔥🔥`);
      });
    } catch (e) {
      console.log(e);
      logger.error('successfullWeekReminder Error: ', e);
    }
  });
};

const dailyMorningReminder = (bot) => {
  cron.schedule('0 9 * * *', async () => {
    try {
      console.log('running a task every day', new Date().getDate());

      const [users, usersIds, tasks] = await Promise.all([
        database.getUsers(),
        database.getChatIds(),
        database.getTask(),
      ]);

      usersIds.forEach(({ id, first_name, username }) => {
        const currentUser = users.find(({ telegram }) => telegram === username);

        if (!currentUser) return;

        const name = first_name ?? username;

        const START_DATE = new Date(2024, 9, 14, 0, 0);
        const END_DATE = new Date(2024, 10, 15, 0, 0);

        const leftDays = getDiffInDays(new Date(), END_DATE);

        const passedDays = getDiffInDays(START_DATE, new Date()) + 1;
        const doneDays = Object.values(tasks).filter((userIds) => userIds.includes(currentUser.id));

        bot.telegram.sendMessage(id, `Доброе утро ${name}!\n\nДо конца челленджа осталось ${leftDays} дней!\n`);
      });
    } catch (e) {
      console.log(e);
      logger.error('dailyMorningReminder Error: ', e);
    }
  });
};
function startCron(bot) {
  console.log(bot);

  dailyReminder(bot);
  // successfullWeekReminder(bot);
  dailyMorningReminder(bot);
}

function getDiffInDays(d1, d2) {
  const diffTime = Math.abs(d2 - d1);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}
