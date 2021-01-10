const http = require('http');
const Koa = require('koa');
const koaBody = require('koa-body');
const WS = require('ws');
// const koaBody = require('koa-body');

const port = process.env.PORT || 7070;

const app = new Koa();

let newUser;

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
  let userUnique = true;
  wsServer.clients.forEach((socket) => {
    if (socket.user === ctx.request.body) {
      userUnique = false;
    }
  });
  if (userUnique) {
    ctx.response.status = 200;
    newUser = ctx.request.body;
  } else {
    ctx.response.status = 403;
  }
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
  // console.log('Aaa!');
  // console.log(event);
});

wsServer.on('connection', (ws, req) => {
  console.log('new connection to ws');
  ws.user = newUser;
  // console.log(req);
  const errCallback = (err) => {
    if (err) {
      console.error(err);
    }
  };

  ws.on('message', (msg) => {
    console.log('msg received');

    const msgObj = {
      from: ws.user,
      msg,
    };

    wsServer.clients.forEach((socket) => {
      socket.send(JSON.stringify(msgObj), errCallback);
      console.log('msg sent to', socket.user);
    });
    // ws.send('i hear you!', errCallback);
    // ws.send(JSON.stringify(ws), errCallback);
  });

  ws.on('close', (event) => {
    // console.log(wsServer.clients.size);
  });
});
