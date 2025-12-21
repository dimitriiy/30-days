import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import 'dotenv/config';
import { initRestControllers } from './src/controllers.js';
import { startBot } from './src/telegram/index.js';

const app = express();
const port = 8080;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors());
app.use(express.static('public'));

initRestControllers(app);
// startBot();

app.listen(port, () => {
  console.log(`Example app listening on port ${port} http://localhost:${port}`);
});
