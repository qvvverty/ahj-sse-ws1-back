const http = require('http');
const Koa = require('koa');
// const WS = require('ws');
// const koaBody = require('koa-body');

const port = process.env.PORT || 7070;

const app = new Koa();

// app.use(koaBody({
//   multipart: true,
// }));

const server = http.createServer(app.callback());
server.listen(port, () => {
  console.log(`\x1b[33m> Server ready and listening on ${port}\x1b[0m`);
});
