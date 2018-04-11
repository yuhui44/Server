const User = require('../models/user.js');
const config = require('../configs');
const bcrypt = require('bcrypt');

// 配置邮件服务器
const nodemailer = require('nodemailer');
let transporter = nodemailer.createTransport(config.email);

//创建Token
const jwt = require('jsonwebtoken');
const createToken = async (user_id) => {
  let token = jwt.sign({
    user_id
  }, config.jwt.secret, {
      expiresIn: config.jwt.exprisesIn //过期时间设置为60妙。那么decode这个token的时候得到的过期时间为 : 创建token的时间 +　设置的值
    });
  return token;
};
const createEmailToken = async (decoded) => {
  let token = jwt.sign(decoded, config.emailJwt.secret, {
    expiresIn: config.emailJwt.exprisesIn
  });
  return token;
}
// 发送验证邮箱邮件
const sendEmail = async (ctx, email) => {
  let link = config.checkEmailFontLink + await createEmailToken({ user_id: ctx.request.user._id, email });
  let mailOptions = {
    from: '"知识产权交易平台" <' + config.email.auth.user + '>',
    to: ctx.request.user.email,
    subject: '验证邮箱邮件',
    // text: createEmailToken(ctx.request.user._id)
    html: '<p>点击链接验证当前邮箱：<a href="' + link + '" target="_blank">点我验证<a></p><br/><p>如果链接无法点击请手动复制以下网址在浏览器中打开：</p></br><p>' + link + '</p><br/><p>注意：链接半小时内有效。</p>'
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      ctx.status = 401;
      ctx.body = {
        code: 6,
        msg: '邮件发送失败，请稍后重试或与管理员联系'
      };
      return console.log(error);
    }
    // console.log(info);
  });
  ctx.status = 200;
  ctx.body = {
    code: 2,
    msg: '邮件发送成功，请尽快通过验证'
  };
}

// //数据库的操作
// //根据用户名查找用户
// const findUser = (username) => {
//   return new Promise((resolve, reject) => {
//     User.findOne({ username }, (err, doc) => {
//       if (err) {
//         reject(err);
//       }
//       resolve(doc);
//     });
//   });
// };
// //找到所有用户
// const findAllUsers = () => {
//   return new Promise((resolve, reject) => {
//     User.find({}, (err, doc) => {
//       if (err) {
//         reject(err);
//       }
//       resolve(doc);
//     });
//   });
// };
// //删除某个用户
// const delUser = function (id) {
//   return new Promise((resolve, reject) => {
//     User.findOneAndRemove({ _id: id }, err => {
//       if (err) {
//         reject(err);
//       }
//       resolve();
//     });
//   });
// };

class UserController {
  //用户登录(创建token)
  static async login(ctx) {
    //如果账号格式有误
    //(!ctx.request.body.account || (((!/^(?!_)(?!.*?_$)[a-zA-Z0-9_\u4e00-\u9fa5]{4,20}$/.test(value)) || (/^[0-9]*$/.test(value))) && !/^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/.test(value)))
    if (!(ctx.request.body.account && (/^(?!_)(?!.*?_$)[a-zA-Z0-9_\u4e00-\u9fa5]{4,20}$/.test(ctx.request.body.account) && !/^[0-9]*$/.test(ctx.request.body.account) || /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/.test(ctx.request.body.account)))) {
      ctx.status = 401;
      ctx.body = {
        code: 6,
        msg: '账号格式有误！'
      };
      //如果密码格式有误
    } else if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/.test(ctx.request.body.password) || !ctx.request.body.password) {
      ctx.status = 401;
      ctx.body = {
        code: 6,
        msg: '密码格式有误！'
      };
      //格式无误，账号分类
    } else {
      //不包含“@”，即username
      if (ctx.request.body.account.indexOf("@") === -1) {
        let result = await User
          .findOne({
            username: ctx.request.body.account,
            isDelete: false
          })
          .exec()
          .catch(err => {
            ctx.throw(500, 'find username error');
          });
        if (!result) {
          //查找不到用户
          ctx.status = 401;
          ctx.body = {
            code: 6,
            msg: '用户不存在！'
          };
        } else {
          //找到用户
          if (await bcrypt.compare(ctx.request.body.password, result.password)) {
            //密码正确
            let token = await createToken(result._id);
            ctx.status = 200;
            ctx.cookies.set('token', token);
            ctx.body = {
              code: 2,
              msg: '登录成功！'
            };
          } else {
            //密码错误
            ctx.status = 401;
            ctx.body = {
              code: 6,
              msg: '密码错误！'
            };
          }
        }
      } else {
        //含有“@”，即email
        let result = await User
          .findOne({
            email: ctx.request.body.account,
            isDelete: false
          })
          .exec()
          .catch(err => {
            ctx.throw(500, 'find email error');
          });
        if (!result) {
          //查找不到用户
          ctx.status = 401;
          ctx.body = {
            code: 6,
            msg: '邮箱未注册！'
          };
        } else {
          //找到用户
          if (await bcrypt.compare(ctx.request.body.password, result.password)) {
            //密码正确
            let token = await createToken(result._id);
            ctx.status = 200;
            ctx.cookies.set('token', token);
            ctx.body = {
              code: 2,
              msg: '登录成功！'
            };
          } else {
            //密码错误
            ctx.status = 401;
            ctx.body = {
              code: 6,
              msg: '密码错误！'
            };
          }
        }
      }
    }
  };
  //用户退出
  static async logout(ctx) {
    ctx.status = 200;
    ctx.cookies.set('token', null);
    ctx.body = {
      code: 2,
      msg: '退出成功！'
    };
  };
  //用户基本状态查询
  static async userStatus(ctx) {
    //不存在token
    if (!ctx.cookies.get('token')) {
      ctx.status = 200;
      ctx.body = {
        code: 1,
        isLogin: false,
        msg: '未登录（不存在token）！'
      };
      //存在token
    } else {
      let decoded;
      try {
        decoded = jwt.verify(ctx.cookies.get('token'), config.jwt.secret);
      } catch (err) {
        // token不合法或过期
        ctx.status = 200;
        ctx.body = {
          code: 1,
          isLogin: false,
          msg: '未登录（token不合法）'
        };
      }
      if (decoded) {
        // token合法
        let result = await User
          .findOne({
            _id: decoded.user_id,
            isDelete: false
          })
          .exec()
          .catch(err => {
            ctx.throw(500, 'find user_id error');
          });
        if (!result) {
          //查找不到用户
          ctx.status = 200;
          ctx.body = {
            code: 1,
            isLogin: false,
            msg: '未登录（用户不存在）'
          };
          //找到用户
        } else {
          //邮箱未验证
          if (!result.emailConfirmation) {
            ctx.status = 200;
            ctx.body = {
              code: 4,
              username: result.username,
              isLogin: true,
              isAdmin: result.isAdmin,
              msg: '邮箱未认证，请尽快前往认证！'
            };
          } else {
            ctx.status = 200;
            ctx.body = {
              code: 1,
              isLogin: true,
              username: result.username,
              isAdmin: result.isAdmin,
              msg: '已登录'
            };
          }
        }
      }
    }
  };

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
            createTime: new Date()
          });
          let result = await user
            .save()
            .catch(err => {
              ctx.throw(500, 'register user error');
            });
          password = null;
          let token = await createToken(result._id);
          ctx.status = 200;
          ctx.cookies.set('token', token);
          ctx.body = {
            code: 2,
            msg: '用户注册成功！'
          };
        }
      }
    }
  };
  //获取用户信息
  static async getUserInfo(ctx) {
    // checkToken已经把user写入ctx.request.user中
    ctx.status = 200;
    ctx.body = {
      code: 1,
      msg: '请求成功！',
      user_id: ctx.request.user._id,
      username: ctx.request.user.username,
      email: ctx.request.user.email,
      emailConfirmation: ctx.request.user.emailConfirmation,
      telephone: ctx.request.user.telephone,
      qqNumber: ctx.request.user.qqNumber,
      wechat: ctx.request.user.wechat,
      message: ctx.request.user.message,
      isDisabled: ctx.request.user.isDisabled,
      createTime: ctx.request.user.createTime
    };
  };
  // 修改用户信息
  static async postUserInfo(ctx) {
    //如果用户名存在且格式有误
    if ( (!/^(?![0-9]+$)(?!_)(?!.*?_$)[a-zAZ0-9_\u4e00-\u9fa5]{4,20}$/.test(ctx.request.body.username)) && ctx.request.body.username ) {
      ctx.status = 401;
      ctx.body = {
        code: 4,
        msg: '用户名格式有误！'
      };
      return;
    }
    //如果邮箱存在且有误
    if ((!/^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/.test(ctx.request.body.email)) && ctx.request.body.email) {
      ctx.status = 401;
      ctx.body = {
        code: 4,
        msg: '邮箱格式有误！'
      };
      return;
    }
    let userInfo = {};
    if ( ctx.request.body.username ) {
      userInfo.username = ctx.request.body.username;
    }
    if ( ctx.request.body.telephone ) {
      userInfo.telephone = ctx.request.body.telephone;
    }
    if ( ctx.request.body.qqNumber ) {
      userInfo.qqNumber = ctx.request.body.qqNumber;
    }
    if ( ctx.request.body.wechat ) {
      userInfo.wechat = ctx.request.body.wechat;
    }
    if ( ctx.request.body.message !== null ) {
      userInfo.message = ctx.request.body.message;
    }
    // 如果不存在user_id，说明是普通用户
    if (!ctx.request.body._id) {
      await User
        .findByIdAndUpdate(ctx.request.user._id, userInfo)
        .exec()
        .catch(err => {
          ctx.throw(500, 'write user info error');
        });
      ctx.status = 200;
      ctx.body = {
        code: 2,
        msg: '用户信息修改成功'
      };
    } else {
      // 存在用户Id，执行管理员权限
      if (!ctx.request.user.isAdmin) {
        ctx.status = 401;
        ctx.body = {
          code: 6,
          msg: '当前用户不是管理员'
        };
        return;
      }
      if ( ctx.request.body.email ) {
        userInfo.email = ctx.request.body.email;
      }
      if ( ctx.request.body.createTime ) {
        userInfo.createTime = ctx.request.body.createTime;
      }
      if ( ctx.request.body.emailConfirmation !== null ) {
        userInfo.emailConfirmation = ctx.request.body.emailConfirmation;
      }
      if ( ctx.request.body.isAdmin !== null ) {
        userInfo.isAdmin = ctx.request.body.isAdmin;
      }
      if ( ctx.request.body.isDisabled !== null ) {
        userInfo.isDisabled = ctx.request.body.isDisabled;
      }
      // if ( ctx.request.body.isDelete !==null ) {
      //   userInfo.isDelete = ctx.request.body.isDelete;
      // }
      await User
        .findByIdAndUpdate(ctx.request.body._id, userInfo)
        .exec()
        .catch(err => {
          ctx.throw(500, 'write user info error');
        });
      ctx.status = 200;
      ctx.body = {
        code: 2,
        msg: '用户信息修改成功'
      };
    }
  };
  // 重新发送验证邮件
  static async resendEmail(ctx) {
    // 如果已经通过验证
    if (ctx.request.user.emailConfirmation) {
      ctx.status = 401;
      ctx.body = {
        code: 6,
        msg: '邮箱已通过验证'
      };
    } else {
      await sendEmail(ctx, ctx.request.user.email);
    }
  };
  // 检查验证邮箱链接
  static async checkEmailToken(ctx) {
    // 不存在token
    if (!ctx.request.body.token) {
      ctx.status = 401;
      ctx.body = {
        code: 6,
        msg: '验证有误，请重试'
      };
    } else {
      let decoded;
      try {
        decoded = jwt.verify(ctx.request.body.token, config.emailJwt.secret);
      } catch (err) {
        // token不合法或过期
        ctx.status = 401;
        ctx.body = {
          code: 6,
          msg: '验证超时，请重新发起验证'
        };
        return;
      }
      if (decoded) {
        // token合法
        if (!decoded.email) {
          ctx.status = 401;
          ctx.body = {
            code: 6,
            msg: 'token不包含邮箱地址，请与管理员联系'
          };
          return;
        }
        let result = await User
          .findOne({
            _id: decoded.user_id,
            isDelete: false
          })
          .exec()
          .catch(err => {
            ctx.throw(500, 'find user_id error');
          });
        if (!result) {
          // 查找不到用户
          ctx.status = 401;
          ctx.body = {
            code: 6,
            msg: '用户不存在'
          };
          //找到用户
        } else {
          await User
            .findByIdAndUpdate(decoded.user_id, {
              emailConfirmation: true,
              email: decoded.email
            })
            .exec()
            .catch(err => {
              ctx.theow(5000, 'write user info error');
            });
          ctx.status = 200;
          ctx.body = {
            code: 2,
            email: decoded.email,
            msg: '邮箱验证成功'
          };
        }
      }
    }
  };
  //修改密码
  static async changePassword(ctx) {
    // 原密码格式有误
    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/.test(ctx.request.body.oldPassword) || !ctx.request.body.oldPassword) {
      ctx.status = 401;
      ctx.body = {
        code: 6,
        msg: '原密码格式有误！'
      };
    } else if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/.test(ctx.request.body.newPassword) || !ctx.request.body.newPassword) {
      ctx.status = 401;
      ctx.body = {
        code: 6,
        msg: '新密码格式有误！'
      };
    } else if (ctx.request.body.oldPassword === ctx.request.body.newPassword) {
      ctx.status = 401;
      ctx.body = {
        code: 6,
        msg: '新密码不能与原密码相同！'
      };
    } else {
      if (await bcrypt.compare(ctx.request.body.oldPassword, ctx.request.user.password)) {
        //原密码正确
        // 加密新密码
        let password = await bcrypt.hash(ctx.request.body.newPassword, 12);
        await User
          .findByIdAndUpdate(ctx.request.user._id, {
            password
          })
          .exec()
          .catch(err => {
            ctx.throw(500, 'write user password error');
          });
        ctx.status = 200;
        ctx.body = {
          code: 2,
          msg: '密码修改成功'
        };
        password = null;
      } else {
        //原密码错误
        ctx.status = 401;
        ctx.body = {
          code: 6,
          msg: '原密码错误！'
        };
      }
    }
  };
  // 修改邮箱
  static async changeEmail(ctx) {
    // 原密码格式有误
    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/.test(ctx.request.body.password) || !ctx.request.body.password) {
      ctx.status = 401;
      ctx.body = {
        code: 6,
        msg: '密码格式有误！'
      };
    } else if (!/^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/.test(ctx.request.body.email) || !ctx.request.body.email) {
      ctx.status = 401;
      ctx.body = {
        code: 6,
        msg: '邮箱格式有误！'
      };
      //如果密码格式有误
    } else if (ctx.request.body.email === ctx.request.user.email) {
      ctx.status = 401;
      ctx.body = {
        code: 6,
        msg: '不能与原来的邮箱一样'
      };
      // 检查密码是否正确
    } else if (await bcrypt.compare(ctx.request.body.password, ctx.request.user.password)) {
      await sendEmail(ctx, ctx.request.body.email);
    }
  }
  // 忘记密码
  static async forgetPassword(ctx) {
    //如果账号格式有误
    if (!(ctx.request.body.account && (/^(?!_)(?!.*?_$)[a-zA-Z0-9_\u4e00-\u9fa5]{4,20}$/.test(ctx.request.body.account) && !/^[0-9]*$/.test(ctx.request.body.account) || /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/.test(ctx.request.body.account)))) {
      ctx.status = 401;
      ctx.body = {
        code: 6,
        msg: '账号格式有误！'
      };
    } else {
      let result;
      //不包含“@”，即username
      if (ctx.request.body.account.indexOf("@") === -1) {
        result = await User
          .findOne({
            username: ctx.request.body.account,
            isDelete: false
          })
          .exec()
          .catch(err => {
            ctx.throw(500, 'find username error');
          });
        if (!result) {
          //查找不到用户
          ctx.status = 401;
          ctx.body = {
            code: 6,
            msg: '用户不存在！'
          };
          return;
        }
      } else {
        //含有“@”，即email
        result = await User
          .findOne({
            email: ctx.request.body.account,
            isDelete: false
          })
          .exec()
          .catch(err => {
            ctx.throw(500, 'find email error');
          });
        if (!result) {
          //查找不到用户
          ctx.status = 401;
          ctx.body = {
            code: 6,
            msg: '邮箱未注册！'
          };
          return;
        }
      }
      // 找到用户
      let link = config.resetPasswordFontLink + await createEmailToken({ user_id: result._id });
      let mailOptions = {
        from: '"知识产权交易平台" <' + config.email.auth.user + '>',
        to: result.email,
        subject: '重置密码邮件',
        // text: createEmailToken(ctx.request.user._id)
        html: '<p>点击链接前往重置密码：<a href="' + link + '" target="_blank">点我验证<a></p><br/><p>如果链接无法点击请手动复制以下网址在浏览器中打开：</p></br><p>' + link + '</p><br/><p>注意：链接半小时内有效。</p>'
      };
      // console.log(mailOptions);
      try {
        await transporter.sendMail(mailOptions);
      } catch (error) {
        ctx.status = 401;
        ctx.body = {
          code: 6,
          msg: '邮件发送失败，请稍后重试或与管理员联系'
        };
        console.log(error);
        return;
      }
      ctx.status = 200;
      ctx.body = {
        code: 2,
        msg: '邮件发送成功，请尽快前往重置密码'
      };
    }
  }
  // 重置密码（先检查token有效性）
  static async resetPassword1(ctx) {
    // 不存在token
    if (!ctx.request.body.token) {
      ctx.status = 401;
      ctx.body = {
        code: 6,
        msg: '请求有误，请重试'
      };
    } else {
      let decoded;
      try {
        decoded = jwt.verify(ctx.request.body.token, config.emailJwt.secret);
      } catch (err) {
        // token不合法或过期
        ctx.status = 401;
        ctx.body = {
          code: 6,
          msg: '重置密码超时，请重新发起'
        };
        return;
      }
      if (decoded) {
        // token合法
        let result = await User
          .findOne({
            _id: decoded.user_id,
            isDelete: false
          })
          .exec()
          .catch(err => {
            ctx.throw(500, 'find user_id error');
          });
        if (!result) {
          // 查找不到用户
          ctx.status = 401;
          ctx.body = {
            code: 6,
            msg: '用户不存在'
          };
          //找到用户
        } else {
          ctx.status = 200;
          ctx.body = {
            code: 1,
            email: result.email,
            msg: 'token有效，进行下一步密码重置'
          };
        }
      }
    }
  };
  // 重置密码（再进行密码的输入）
  static async resetPassword2(ctx) {
    // 密码格式有误
    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/.test(ctx.request.body.password) || !ctx.request.body.password) {
      ctx.status = 401;
      ctx.body = {
        code: 6,
        msg: '密码格式有误！'
      };
      // 不存在token
    } else if (!ctx.request.body.token) {
      ctx.status = 401;
      ctx.body = {
        code: 6,
        msg: '请求有误，请重试'
      };
    } else {
      let decoded;
      try {
        decoded = jwt.verify(ctx.request.body.token, config.emailJwt.secret);
      } catch (err) {
        // token不合法或过期
        ctx.status = 401;
        ctx.body = {
          code: 6,
          msg: '重置密码超时，请重新发起'
        };
        return;
      }
      if (decoded) {
        // token合法
        let result = await User
          .findOne({
            _id: decoded.user_id,
            isDelete: false
          })
          .exec()
          .catch(err => {
            ctx.throw(500, 'find user_id error');
          });
        if (!result) {
          // 查找不到用户
          ctx.status = 401;
          ctx.body = {
            code: 6,
            msg: '用户不存在'
          };
          //找到用户
        } else {
          // 加密新密码
          let password = await bcrypt.hash(ctx.request.body.password, 12);
          await User
            .findByIdAndUpdate(decoded.user_id, {
              password
            })
            .exec()
            .catch(err => {
              ctx.theow(5000, 'write user password error');
            });
          ctx.status = 200;
          ctx.body = {
            code: 2,
            email: result.email,
            msg: '密码修改成功'
          };
        }
      }
    }
  };
  //获得所有用户信息
  static async getAllUsers(ctx) {
    //查询所有用户信息
    let doc = await User
      .find({
        isDelete: false
      })
      .select('message isAdmin emailConfirmation username email createTime isDisabled qqNumber telephone wechat')
      .exec()
      .catch(err => {
        ctx.throw(500, 'find all users error');
      });
    if (!doc) {
      ctx.status = 401;
      ctx.body = {
        code: 6,
        msg: '查找不到用户！'
      };
      return;
    }
    ctx.status = 200;
    ctx.body = {
      code: 1,
      msg: '获取所有用户信息成功！',
      users: doc
    };
  };
  // // 为用户增加产权
  // static async setUserAddProperty(id, propertyId) {
  //   return await User
  //     .findByIdAndUpdate(id, { $push: { propertys: propertyId }})
  //     .exec()
  //     .catch(err => {
  //       ctx.throw(500, 'set user add property error');
  //     });
  // }
  // //删除某个用户
  // static async delUser(ctx) {
  //   //拿到要删除的用户id
  //   let id = ctx.request.body.id;
  //   await delUser(id);
  //   ctx.status = 200;
  //   ctx.body = {
  //     success: '删除成功'
  //   };
  // };
};
exports = module.exports = UserController;