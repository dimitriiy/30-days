import { Telegraf } from 'telegraf';
import cron from 'node-cron';
import { END_OF_DAY, SUCCESS_WEEK } from './messages.js';
import { database } from '../db.js';
import { endOfMonth } from '../../utils.js';
import { logger } from '../../logger.js';
import { getInfoStat } from './view.js';
import { questions } from './tasks.js';

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
  cron.schedule('0 23 * * *', async () => {
    try {
      console.log('running a task every evening', new Date().getDate());

      const currentDate = new Date().getDate();
      const [users, tasks, usersIds] = await Promise.all([
        database.getUsers(),
        database.getTask(),
        database.getChatIds(),
      ]);

      usersIds.forEach(({ id, first_name, username }) => {
        const currentUser = users.find(({ telegram }) => telegram === username);
        const isCurrentUserDoneToday = tasks[currentDate]?.includes(currentUser.id);

        console.log({ currentUser, isCurrentUserDoneToday, currentDate });

        const name = first_name ?? username;
        const greet = `${name} 🤟\n Вот и подошел еще один день к концу!`;

        bot.telegram.sendMessage(id, greet);
      });
    } catch (e) {
      console.log(e);
      logger.error('dailyReminder Error: ', e);
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

        const endOfMonthDate = endOfMonth(new Date());
        const daysInMonth = endOfMonthDate.getDate();
        const leftDays = daysInMonth - new Date().getDate() + 1 - 3;

        bot.telegram.sendMessage(id, `Доброе утро ${name}!\n\nДо конца челленджа осталось ${leftDays} дней!`);
        bot.telegram.sendMessage(id, `Прочитай все условия и да начнется игра!`);

        const question = questions[daysInMonth];
        if (!question) return;

        setTimeout(() => {
          const questionText = `<b>${question.title}</b>\n ${question.questions.map((q, i) => `${i + 1}) ${q}`).join('\n')}`;
          const info = `Дополнительное задание на сегодня:`;
          bot.telegram.sendMessage(id, `${info} \n\n${questionText}`, { parse_mode: 'HTML' });
        }, 1000 * 15);
      });
    } catch (e) {
      console.log(e);
      logger.error('dailyMorningReminder Error: ', e);
    }
  });
};
function startCron(bot) {
  dailyReminder(bot);
  dailyMorningReminder(bot);
}
