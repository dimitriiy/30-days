import { Telegraf, Markup } from 'telegraf';
import cron from 'node-cron';
import { END_OF_DAY, SUCCESS_WEEK } from './messages.js';
import { database } from '../db.js';
import { logger } from '../../logger.js';
import config from '../../challenge.config.js';
import fs from 'fs';
import { Readable } from 'stream';
import { v7 } from 'uuid';
import { writeFile } from 'fs/promises';
import { message } from 'telegraf/filters';
import { finished } from 'stream/promises';

const RULES = [
  '🚫  Не есть мучное 🥞, можно немного хлеба',
  '🚫 Не есть жареное 🥓',
  '🚫 Не есть сладкое 🍬, за исключением фруктов двух фруктов в день 🍏🍏',
  '🚫 Не есть фастфуд 🍟 и прочую вредную пищу',
  '🏃💪🧘 Каждый день тренировка или прогулка 7к шагов',
];

//https://github.com/feathers-studio/telegraf-docs/blob/master/examples/keyboard-bot.ts
export async function startBot() {
  try {
    const bot = new Telegraf(process.env.BOT_TOKEN);
    bot.start(async (ctx) => {
      const { id, first_name, username } = ctx.message.chat;
      await database.addChatUser({ id, first_name, username });

      await ctx.reply(`${first_name}, добро пожаловать в игру!`);
      await ctx.replyWithPhoto({ source: process.cwd() + '/src/telegram' + '/games.jpg' });
      const rules = RULES.map((s, i) => `${i + 1}. ${s}`).join('\n');
      ctx.reply(`Правила:\n\n${rules}`);
    });
    // bot.on(message('text'), async (ctx) => {
    //   const text = ctx.message.text;
    //   const { id, first_name, username } = ctx.message.chat;
    //
    //   if (!isNaN(parseFloat(text))) {
    //     const user = database.getUsers().find((u) => u.telegram === username);
    //     if (!user) return;
    //     await database.editUser(user.id, { weight: +text });
    //     await ctx.reply(`Отлично, твой вес ${text} кг сохранен. Теперь пришли мне свою фотографию.`);
    //
    //     bot.on('photo', async (ctx) => {
    //       try {
    //         const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
    //
    //         const fileLink = await ctx.telegram.getFileLink(fileId);
    //         console.log(fileLink);
    //         // Получаем поток для скачивания файла
    //         const res = await fetch(fileLink);
    //
    //         // Определяем имя файла
    //         const fileName = `./images/${v7()}.jpg`;
    //
    //         // Сохраняем файл
    //         await savePhoto(res, fileName);
    //         console.log({ user });
    //         await database.editUser(user.id, { diffPics: [...(user.diffPics ?? []), fileName] });
    //
    //         // Скачивание файла
    //         const filePath = await ctx.telegram.getFileLink(fileId);
    //         console.log(`Фотография получена: ${filePath}`);
    //
    //         await ctx.reply('Спасибо за предоставленную информацию!');
    //       } catch (error) {
    //         console.error(error);
    //         await ctx.reply('Произошла ошибка при получении фотографии.');
    //       }
    //     });
    //   } else {
    //     ctx.reply(`Введи число!`);
    //   }
    // });
    bot.on('stop', () => console.log('STOP'));

    bot.help((ctx) => ctx.reply('Send me a sticker'));
    bot.on('sticker', (ctx) => ctx.reply('👍'));
    bot.hears('hi', (ctx) => ctx.reply('Hey there'));

    // bot.command('custom', async (ctx) => {
    //   return await ctx.reply(
    //     'Custom buttons keyboard',
    //     Markup.keyboard([['Статистика']])
    //       .oneTime()
    //       .resize()
    //   );
    // });
    //
    // bot.hears('🔍 Search', (ctx) => ctx.reply('Yay!'));

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
        bot.telegram.sendMessage(
          id,
          `${name} 🤟\n\n${END_OF_DAY}🏃🏃\n<a href="http://fatburn.ddimedrol.ru/">Клик</a>`,
          {
            parse_mode: 'HTML',
          }
        );
      });
    } catch (e) {
      console.log(e);
      logger.error('dailyReminder Error: ', e);
    }
  });
};

const successfullWeekReminder = (bot) => {
  cron.schedule('10 15 * * *', async () => {
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

      bot.telegram.sendMessage(
        id,
        `Добрый день ${name}!\n\n Завтра начинается новый FatBurn челлендж! 🚀🚀🚀🚀\n Ставки растут - уже на 4️⃣0️⃣️дней!\n Сегодня разузнайте свой актуальный вес и приготовьте фото, в конце челленджа сравним результаты.\n`
      );
    });
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

        const START_DATE = config.startDate;
        const END_DATE = config.endDate;

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

async function savePhoto(data, fileName) {
  try {
    const path = `./photos/${fileName}`;
    const body = Readable.fromWeb(data.body);
    const fileStream = fs.createWriteStream(fileName);
    await finished(body.pipe(fileStream));
    console.log(`Фотография сохранена: ${path}`);
  } catch (err) {
    console.error(err);
  }
}
