// const fs = require('fs');

let config = {
  admin: {
    username: 'admin',
    password: 'admin',
    name: 'sinner77'
  },
  jwt: {
    secret: 'secret',
    exprisesIn: '3600s'  //以秒为单位
  },
  emailJwt: {
    secret: 'emailSecret',
    exprisesIn: '1800s'  //以秒为单位
  },
  mongodb: {
    host: '127.0.0.1',
    database: 'vue-login',
    port: 27017,
    user: '',
    password: ''
  },
  app: {
    port: process.env.PORT || 8888,
    routerBaseApi: '/api'
  }
};

// //可以新建一个private.js定义自己的私有配置
// if(fs.existsSync(__dirname + '/private.js')){
//     config = Object.assign(config, require('./private.js'));
// }

module.exports = config;