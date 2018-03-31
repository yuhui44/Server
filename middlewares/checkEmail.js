// 检查token合法性与是否存在此用户

module.exports = async (ctx, next) => {
  // 邮箱未经过验证
  if (!ctx.request.user.emailConfirmation) {
    ctx.status = 401;
    ctx.body = {
      code: 6,
      msg: '请先验证邮箱！'
    };
  } else {
    await next();
  }
};