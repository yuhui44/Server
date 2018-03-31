// 检查用户是否被禁用

module.exports = async (ctx, next) => {
  if (ctx.request.user.isDisabled) {
    ctx.status = 401;
    ctx.body = {
      code: 6,
      msg: '该用户已被禁用，请与管理员联系。'
    };
  } else {
    await next();
  }
};