// 检查用户是否有admin权限

module.exports = async (ctx, next) => {
  // 用户没有admin权限
  if (!ctx.request.user.isAdmin) {
    ctx.status = 401;
    ctx.body = {
      code: 6,
      msg: '当前用户没有Admin权限，请与管理员联系。'
    };
  } else {
    await next();
  }
};