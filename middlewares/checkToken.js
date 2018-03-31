// 检查token合法性与是否存在此用户
const config = require('../configs');
const User = require('../models/user.js');
const jwt = require('jsonwebtoken');

module.exports = async (ctx, next) => {
  // 不存在token
  if (!ctx.cookies.get('token')) {
    ctx.status = 401;
    ctx.body = {
      code: 9,
      msg: '未登录（不存在token）'
    };
    //存在token
  } else {
    let decoded;
    try {
      decoded = jwt.verify(ctx.cookies.get('token'), config.jwt.secret);
    } catch (err) {
      // token不合法或过期
      ctx.status = 401;
      ctx.body = {
        code: 9,
        msg: '未登录（token不合法）'
      };
    }
    if (decoded) {
      // token合法
      // console.log(decoded);
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
        ctx.status = 401;
        ctx.body = {
          code: 9,
          msg: '未登录（用户不存在）'
        };
        //找到用户
      } else {
        //把用户数据写入请求体中
        ctx.request.user = result;
        // console.log(ctx.request.user);
        await next();
      }
    }
  }
};
