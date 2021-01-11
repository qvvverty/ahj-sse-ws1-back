const http = require('http');
const Koa = require('koa');
const koaBody = require('koa-body');
const WS = require('ws');

const port = process.env.PORT || 7070;

const app = new Koa();

const users = [];

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
  if (!users.includes(ctx.request.body)) {
    ctx.response.status = 200;
    ctx.response.body = JSON.stringify(users);
    users.push(ctx.request.body);
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

// wsServer.on('upgrade', (event) => {

// });

wsServer.on('connection', (ws/* , req */) => {
  console.log('new connection to ws');
  // eslint-disable-next-line no-param-reassign
  ws.user = users[users.length - 1];
  // console.log(req);
  const errCallback = (err) => {
    if (err) {
      console.error(err);
    }
  };

  const newUserMsg = {
    from: 'server',
    type: 'new user',
    message: ws.user,
  };
  const newUserMsgStr = JSON.stringify(newUserMsg);

  wsServer.clients.forEach((socket) => {
    // if (socket.user !== ws.user) {
    socket.send(newUserMsgStr, errCallback);
    console.log('msg sent to', socket.user);
    // }
  });

  ws.on('message', (message) => {
    console.log('msg received');

    const msgObj = {
      from: ws.user,
      message,
    };
    const msgObjStr = JSON.stringify(msgObj);

    wsServer.clients.forEach((socket) => {
      socket.send(msgObjStr, errCallback);
      console.log('msg sent to', socket.user);
    });
    // ws.send('i hear you!', errCallback);
    // ws.send(JSON.stringify(ws), errCallback);
  });

  ws.on('close', (/* event */) => {
    // console.log(event);
    // console.log(wsServer.clients.size);
    const deleteIndex = users.indexOf(ws.user);
    if (deleteIndex >= 0) users.splice(deleteIndex, 1);
    console.log(`${ws.user}: connection closed`);

    const userLeftMsg = {
      from: 'server',
      type: 'user left',
      message: ws.user,
    };
    const userLeftMsgStr = JSON.stringify(userLeftMsg);
    wsServer.clients.forEach((socket) => {
      socket.send(userLeftMsgStr, errCallback);
      console.log('msg sent to', socket.user);
    });
  });
});
