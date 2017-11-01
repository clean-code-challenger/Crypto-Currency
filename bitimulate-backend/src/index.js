require('dotenv').config();
// load enviroment variables
const {
  PORT: port,
  MONGO_URI: mongoUri
} = process.env;

const Koa = require('koa');
const Router = require('koa-router');

const db = require('./db');
db.connect();

const api = require('./api')

const app = new Koa();

const router = new Router();
router.use('/api', api.routes());

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(port, () => {
  console.log('heurm server is listening to port 4000');
});