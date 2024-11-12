import { database } from './db.js';
import { logger } from '../logger.js';
import config from '../challenge.config.js';

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
};

export function initRestControllers(app) {
  Object.entries(controllers).forEach(([route, methods]) => {
    Object.entries(methods).forEach(([method, handler]) => {
      app[method](route, handler);
    });
  });
}
