const User = require('../models/user.js');
const config = require('../configs');
const bcrypt = require('bcrypt');

//返回数据格式
//{ msg: '', success: boolean, data: {} }
//注意ctx.success在条件分支语句中需要加return,不然继续往下执行

//创建Token
const jwt = require('jsonwebtoken');
const createToken = user_id => {
  const token = jwt.sign({
    user_id
  }, config.jwt.secret, {
      expiresIn: config.jwt.exprisesIn //过期时间设置为60妙。那么decode这个token的时候得到的过期时间为 : 创建token的时间 +　设置的值
    });
  return token;
};

//数据库的操作
//根据用户名查找用户
const findUser = (username) => {
  return new Promise((resolve, reject) => {
    User.findOne({ username }, (err, doc) => {
      if (err) {
        reject(err);
      }
      resolve(doc);
    });
  });
};
//找到所有用户
const findAllUsers = () => {
  return new Promise((resolve, reject) => {
    User.find({}, (err, doc) => {
      if (err) {
        reject(err);
      }
      resolve(doc);
    });
  });
};
//删除某个用户
const delUser = function (id) {
  return new Promise((resolve, reject) => {
    User.findOneAndRemove({ _id: id }, err => {
      if (err) {
        reject(err);
      }
      console.log('删除用户成功');
      resolve();
    });
  });
};

class UserController {
  //用户登录(创建token)
  static async login(ctx) {
    //查找用户
    let result = await User
      .findOne({
        username: ctx.request.body.username
      })
      .exec()
      .catch(err => {
        ctx.throw(500, 'findUser error');
      });
    if (result) {
      //查找到用户
      //校验密码
      if (await bcrypt.compare(ctx.request.body.password, result.password)) {
        //密码正确
        console.log('密码正确！');
        let token = createToken(result._id);
        console.log(token);
        ctx.status = 200;
        ctx.cookies.set('token', token);
        ctx.body = {
          success: true,
          username: ctx.request.body.username,
          token //登录成功要创建一个新的token
        };
      } else {
        //密码错误
        console.log('密码错误!');
        ctx.status = 200;
        ctx.body = {
          success: false
        };
      }
    } else {
      //查找不到用户
      console.log('检查到用户名不存在');
      // ctx.status = 200;
      // ctx.body = {
      //   info: false
      // };
      ctx.throw(500, 'findUser error');
    }

    // let doc = await findUser(username);
    // if (!doc) {
    //   console.log('检查到用户名不存在');
    //   ctx.status = 200;
    //   ctx.body = {
    //     info: false
    //   }
    // } else if (doc.password === password) {
    //   console.log('密码一致!');

    //   //生成一个新的token,并存到数据库
    //   let token = createToken(username);
    //   console.log(token);
    //   doc.token = token;
    //   await new Promise((resolve, reject) => {
    //     doc.save((err) => {
    //       if (err) {
    //         reject(err);
    //       }
    //       resolve();
    //     });
    //   });

    //   ctx.status = 200;
    //   ctx.body = {
    //     success: true,
    //     username,
    //     token, //登录成功要创建一个新的token,应该存入数据库
    //     create_time: doc.create_time
    //   };
    // } else {
    //   console.log('密码错误!');
    //   ctx.status = 200;
    //   ctx.body = {
    //     success: false
    //   };
    // }
  };
  // //用户退出(由前台控制即可)
  // static async logout(ctx) {
  //   ctx.success({
  //     msg: '退出成功!',
  //     success: true
  //   });
  // }
  // //更新用户资料(到时再看看需要记录什么资料信息)
  // static async updateUserMes(ctx) {
  //   ctx.success({
  //     msg: '通过!'
  //   });
  // }
  // //重置密码
  // static async resetPwd(ctx) {
  //   const uid = ctx.request.body.id;
  //   const password = md5(ctx.request.body.password);
  //   await User
  //     .findByIdAndUpdate(uid, {
  //       password
  //     })
  //     .exec()
  //     .catch(err => {
  //       ctx.throw(500, '服务器内部错误-modifyPwd错误！');
  //     });
  //   ctx.success({
  //     msg: '更改管理员密码成功!',
  //     success: true
  //   });
  // }

  //注册账号
  static async register(ctx) {
    //如果用户名格式有误
    if ((!/^(?!_)(?!.*?_$)[a-zA-Z0-9_\u4e00-\u9fa5]{4,20}$/.test(ctx.request.body.username)) || (/^[0-9]*$/.test(ctx.request.body.username)) || !ctx.request.body.username) {
      ctx.status = 401;
      ctx.body = {
        code: 6,
        msg: '用户名格式有误！'
      };
      //如邮箱格式有误
    } else if (!/^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/.test(ctx.request.body.email) || !ctx.request.body.email) {
      ctx.status = 401;
      ctx.body = {
        code: 6,
        msg: '邮箱格式有误！'
      };
      //如果密码格式有误
    } else if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/.test(ctx.request.body.password) || !ctx.request.body.password) {
      ctx.status = 401;
      ctx.body = {
        code: 6,
        msg: '密码格式有误！'
      };
    } else {
      //格式都正确，查看是否已存在此用户名
      let result = await User
        .findOne({
          username: ctx.request.body.username,
          isDelete: false
        })
        .exec()
        .catch(err => {
          ctx.throw(500, 'find username error');
        });
      if (result) {
        ctx.status = 401;
        ctx.body = {
          code: 6,
          msg: '用户名已被注册！'
        };
      } else {
        //查看是否存在此邮箱
        let result = await User
          .findOne({
            email: ctx.request.body.email,
            isDelete: false
          })
          .exec()
          .catch(err => {
            ctx.throw(500, 'find email error');
          });
        if (result) {
          ctx.status = 401;
          ctx.body = {
            code: 6,
            msg: '邮箱已被注册！'
          };
        } else {
          //写入数据库
          let password = await bcrypt.hash(ctx.request.body.password, 12);
          let user = new User({
            username: ctx.request.body.username,
            email: ctx.request.body.email,
            password, //加密
            create_time: new Date()
          });
          let result = await user
            .save()
            .catch(err => {
              ctx.throw(500, 'register user error');
            });
          password = null;
          console.log('a', password);
          console.log('b', result._id);
          let token = createToken(result._id);
          ctx.status = 200;
          ctx.cookies.set('token', token);
          ctx.body = {
            code: 3,
            msg: '用户注册成功！'
          };
        }
      }
    }
  };

  //获得所有用户信息
  static async getAllUsers(ctx) {
    //查询所有用户信息
    let doc = await findAllUsers();
    ctx.status = 200;
    ctx.body = {
      succsess: '成功',
      result: doc
    };
  };
  //删除某个用户
  static async delUser(ctx) {
    //拿到要删除的用户id
    let id = ctx.request.body.id;
    await delUser(id);
    ctx.status = 200;
    ctx.body = {
      success: '删除成功'
    };
  };
};

exports = module.exports = UserController;