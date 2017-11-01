const Router = require('koa-router');

const auth = new Router();

auth.get('/', (ctx) => {
  ctx.body = '라우팅설정성공';
});

module.exports = auth;