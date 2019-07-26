const Koa = require('koa');
const Router = require('koa-router');
const websockify = require('koa-websocket');

const app = websockify(new Koa());

let clients = {}
let buff = {}

var router = new Router();
// Using routes
router.all('/bootstrap', function (ctx) {
    ctx.websocket.on('message', function(message) {
        console.log(message)
        let data = JSON.parse(message);
        if ( clients[data.from] == undefined ) {
            clients[data.from] = ctx.websocket;
        }

        if ( buff[data.from] != undefined && buff[data.from].length != 0 ) {
            for (let x of buff[data.from]) {
                clients[data.from].send(JSON.stringify(x));
                console.log(`${data.from} online ,send ${buff[data.from].length}'s data`)
            }
            buff[data.from] = [];
        }

        if ( clients[data.to] == undefined ) {
            // 不存在to，缓存数据。
            if (buff[data.to] == undefined) {
                buff[data.to] = [];
            }
            buff[data.to].push(data);
            console.log(`recv data from ${data.from} to ${data.to}, cached`);
        } else {
            clients[data.to].send(JSON.stringify(data));
            console.log(`recv data from ${data.from} to ${data.to}, send`);
        }
    });
});

app.ws
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(3000);
