const Koa = require('koa')
const app = new Koa()

// //response中间件
// const response = require('./middlewares/response.js');
// //try/catch中间件
// const errorHandle = require('./middlewares/errorHandle.js');
// //initAdmin中间件
// const initAdmin = require('./middlewares/initAdmin.js');

// const json = require('koa-json')

//配置文件
const config = require('./configs');

//mongoose
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const mongoUrl = config.mongodb.user === '' ? `mongodb://${ config.mongodb.host }:${ config.mongodb.port }/${ config.mongodb.database }` : `mongodb://${ config.mongodb.user }:${ config.mongodb.password }@${ config.mongodb.host }:${ config.mongodb.port }/${ config.mongodb.database }`; 
mongoose.connect(mongoUrl);
const db = mongoose.connection;
db.on('error', () => {
    console.log('数据库连接出错!');
});
db.once('open', () => {
    console.log('数据库连接成功！');
});

// error handler
const onerror = require('koa-onerror');
onerror(app);

const bodyparser = require('koa-bodyparser');
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}));

// //使用response中间件(放在最前面)
// app.use(response);

// app.use(json())

const logger = require('koa-logger');
app.use(logger());

// app.use(require('koa-static')(__dirname + '/public'));

// //使用errorHandle中间件
// app.use(errorHandle);

// routes
// const index = require('./routes/index')
const user = require('./routes/user');
// app.use(index.routes(), index.allowedMethods());
app.use( user.routes(), user.allowedMethods());

// // error-handling
// app.on('error', (err, ctx) => {
//   console.error('server error', err, ctx)
// });

module.exports = app
