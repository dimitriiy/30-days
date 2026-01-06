import { database } from './db.js';
import { logger } from '../logger.js';
import config from '../challenge.config.js';
import path from 'path';
import fs from 'fs/promises';
import ytdl from '@distube/ytdl-core';
import { createRequire } from 'module';
import { getAvailableQualities, getYoutubeVideoData } from './video-utils.js';

const require = createRequire(import.meta.url);

export const controllers = {
  '/': {
    get: (req, res) => {
      res.sendFile(`${process.cwd()}/public/index.html`);
    },
  },
  '/users': {
    post: async (req, res) => {
      const users = await database.getUsers();
      res.json(users);
    },
  },
  '/challenge': {
    post: async (req, res) => {
      res.json(config);
    },
  },
  '/tasks': {
    post: async (req, res) => {
      try {
        const data = await database.getTask();

        console.log(data);
        res.json(data);
      } catch (e) {
        res.json({ result: false });
      }
    },
    put: async (req, res) => {
      try {
        const { id, day, isDone } = req.body;

        const data = await database.editTask({ isDone, id, day });

        console.log(data);
        res.json({ result: true });
      } catch (e) {
        res.json({ result: false });
      }
    },
  },
  '/file': {
    post: async (req, res) => {
      const { answer, pass } = req.body;
      const fileByName = { вика: 1, эдик: 2, маша: 3, оля: 4, саша: 5, наташа: 6, аня: 7, ира: 8, гева: 9, юля: 10 };

      if (answer !== 'лошадь' || fileByName[pass] === undefined) {
        res.status(403).send();
        return;
      }

      var data = await fs.readFile(path.join(process.cwd(), 'src', 'pdfs', `output_${fileByName[pass]}.pdf`));
      res.contentType('application/pdf');
      res.send(data);
    },
  },

  '/get-basic-info': {
    post: async (req, res) => {
      const { link } = req.body;
      console.log({ link });

      const data = await getYoutubeVideoData(link);
      res.json(data);
    },
  },
};

export function initRestControllers(app) {
  Object.entries(controllers).forEach(([route, methods]) => {
    Object.entries(methods).forEach(([method, handler]) => {
      app[method](route, handler);
    });
  });
}
