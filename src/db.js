import db from './db.json' assert { type: 'json' };
import fs from 'fs/promises';

class DataBase {
  constructor() {
    this.db = db;
  }

  getUsers() {
    return this.db.users;
  }

  getTask() {
    return this.db.tasks;
  }

  async editTask({ id, day, isDone }) {
    const dbCopy = { ...this.db };

    if (!dbCopy.tasks[day]) {
      dbCopy.tasks[day] = [id];
    } else {
      if (dbCopy.tasks[day].includes(id)) {
        dbCopy.tasks[day] = dbCopy.tasks[day].filter((i) => i !== id);
      } else {
        dbCopy.tasks[day].push(id);
      }
    }
    this.db = dbCopy;

    return fs.writeFile('./src/db.json', JSON.stringify(dbCopy, null, 2));
  }

  addChatUser(data) {
    const dbCopy = { ...this.db };
    if (dbCopy.telegram.users.find(({ id }) => id === data.id)) return;

    dbCopy.telegram.users.push(data);
    return fs.writeFile('./src/db.json', JSON.stringify(dbCopy, null, 2));
  }

  getChatIds() {
    return this.db.telegram.users;
  }
}

export const database = new DataBase();
