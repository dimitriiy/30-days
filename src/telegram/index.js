import { Telegraf } from 'telegraf';
import cron from 'node-cron';
import { END_OF_DAY } from './messages.js';
import { database } from '../db.js';

export async function startBot() {
  try {
    const bot = new Telegraf(process.env.BOT_TOKEN);
    bot.start(async (ctx) => {
      const { id, first_name, username } = ctx.message.chat;
      console.log(ctx.message.chat);
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
  }
}

function startCron(bot) {
  console.log(bot);

  cron.schedule('45 23 * * *', async () => {
    console.log('running a task every minute', new Date().getDay());

    const usersIds = await database.getChatIds();

    usersIds.forEach(({ id, first_name, username }) => {
      const name = first_name ?? username;
      bot.telegram.sendMessage(id, `${name} 🤟\n\n${END_OF_DAY}🏃🏃`);
    });
  });
}
