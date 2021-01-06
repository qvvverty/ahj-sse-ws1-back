const http = require('http');
const Koa = require('koa');
const koaBody = require('koa-body');
const WS = require('ws');
// const koaBody = require('koa-body');

const port = process.env.PORT || 7070;

const app = new Koa();

app.use(koaBody({
  multipart: true,
}));

app.use(async (ctx, next) => {
  ctx.response.set({
    // 'Access-Control-Allow-Origin': 'https://qvvverty.github.io',
    'Access-Control-Allow-Origin': '*',
  });
  await next();
});

app.use(async (ctx) => {
  // const request = ctx.request.query;
  // const { method } = request;
  // ctx.response.status = 200;
  // console.log('response sent');
  // console.log(ctx.response);
  // wsServer.forEach((socket) => {
  //   if (socket.name === ctx.request.body) {

  //   }
  // });
});

const server = http.createServer(app.callback());
server.listen(port, () => {
  console.log(`\x1b[33m> Server ready and listening on ${port}\x1b[0m`);
});

const wsServer = new WS.Server({
  server,
  // noServer: true,
  // path: '/ws',
});
wsServer.on('upgrade', (event) => {
  console.log('Aaa!');
  console.log(event);
});

wsServer.on('connection', (ws, req) => {
  console.log('connected to ws');
  console.log(req);
  const errCallback = (err) => {
    if (err) {
      console.error(err);
    }
  };

  // ws.send(JSON.stringify(req), errCallback);

  ws.on('message', (msg) => {
    // if (!ws.user) {
    //   ws.user = msg;
    // }

    console.log('msg received');

    const msgObj = {
      user: ws.user,
      msg,
    };

    wsServer.clients.forEach((socket) => {
      socket.send(JSON.stringify(msgObj), errCallback);
      console.log('sent');
    });
    ws.send('i hear you!', errCallback);
    // ws.send(JSON.stringify(ws), errCallback);
  });

  ws.on('close', (event) => {
    // console.log(wsServer.clients.size);
  });
});
