/* eslint-disable @typescript-eslint/no-var-requires */

const fs = require('fs')
const {join} = require('path')

const Koa = require('koa');
const koaBody = require('koa-body');
const router = require('koa-router')();
const app = new Koa();
app.use(koaBody());

app.use(async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Content-Length, Authorization, X-B3-TraceId, Accept, X-Requested-With , yourHeaderFeild'
  );
  ctx.set('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  if (ctx.method == 'OPTIONS') {
    ctx.body = 200;
  } else {
    await next();
  }
});

const sleep = (time) => new Promise((resolve) => setTimeout(() => resolve(), time));

router.get('/html', (ctx) => {
  ctx.set('Content-type', 'text/html')
  ctx.body = fs.readFileSync(join(__dirname,'./index.html'))
})
// console.log(Promise);
router.get('/get', (ctx) => {
  ctx.body = {
    stat: 1,
    msg: 'get success',
  };
});
router.get('/get/error', (ctx) => {
  ctx.status = 400;
  ctx.body = {
    msg: 'some params is invalid',
  };
});
router.get('/get/slow', async (ctx) => {
  await sleep(5000);
  ctx.body = {
    stat: 1,
    msg: 'slow get response',
  };
});

router.post('/post', (ctx) => {
  // console.log(ctx.request.body);
  ctx.body = {
    stat: 1,
    msg: 'post success',
  };
});
router.post('/post/error', (ctx) => {
  ctx.status = 400;
  // console.log(c, b, d.d);
  ctx.body = {
    msg: 'some params is invalid',
  };
});
router.post('/post/slow', async (ctx) => {
  await sleep(5000);
  ctx.body = {
    stat: 1,
    msg: 'slow post response',
  };
});

app.use(router.routes());

app.listen(3002);
// eslint-disable-next-line no-console
console.log('server is run http://127.0.0.1:3002');
