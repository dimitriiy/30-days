import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

import db from './db.json' assert { type: 'json' };
import * as fs from 'fs';

const app = express();
const port = 8080;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(`${process.cwd()}/public/index.html`);
});

app.post('/users', (req, res) => {
  res.json(db.users);
});

app.post('/tasks', (req, res) => {
  res.json(db.tasks);
});

app.put('/task', (req, res) => {
  const { id, day, isDone } = req.body;

  console.log(req.body);
  const dbCopy = { ...db };

  if (!dbCopy.tasks[day]) {
    dbCopy.tasks[day] = [id];
  } else {
    if (dbCopy.tasks[day].includes(id)) {
      dbCopy.tasks[day] = dbCopy.tasks[day].filter((i) => i !== id);
    } else {
      dbCopy.tasks[day].push(id);
    }
  }

  fs.writeFile('db.json', JSON.stringify(dbCopy), function (error) {
    if (error) {
      // если ошибка
      return res.send(error);
    }
    res.json({ result: true });
  });
});
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
