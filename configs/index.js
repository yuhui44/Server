// const fs = require('fs');


  // 网站网址
  let webLink = 'http://192.168.10.11';
  // let webLink = 'http://localhost';

let config = {
  // 验证邮箱邮件中的网址前缀
  checkEmailFontLink: webLink + '/valiEmail/',
  // 重置密码邮件中的网址前缀
  resetPasswordFontLink: webLink + '/resetPass/',
  // 用户个人中心-我的转让网站
  myPropertysLink: webLink + '/user/property',
  // 发送邮件的账号
  email: {
    service: '163',
    port: 465,
    secureConnection: true,
    auth: {
      user: 'stuunet@163.com',
      pass: 'scnustuu342'
    }
  },
  // 用于网页登录的token验证
  jwt: {
    secret: 'secret',
    exprisesIn: '12h'  //以秒为单位
  },
  // 用于验证邮箱的token验证
  emailJwt: {
    secret: 'emailSecret',
    exprisesIn: '1800s'  //以秒为单位
  },
  // mongoDB数据库配置
  mongodb: {
    host: '127.0.0.1',
    database: 'idea',
    port: 27017,
    user: '',
    password: ''
  },
  // 服务端接口配置
  app: {
    port: process.env.PORT || 80,
    routerBaseApi: '/api'
  }
};

// //可以新建一个private.js定义自己的私有配置
// if(fs.existsSync(__dirname + '/private.js')){
//     config = Object.assign(config, require('./private.js'));
// }

module.exports = config;