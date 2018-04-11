const router = require('koa-router')();
const config = require('../configs');
router.prefix(config.app.routerBaseApi);

// 中间件
const checkToken = require('../middlewares/checkToken.js');
const checkEmail = require('../middlewares/checkEmail.js');
const checkAdmin = require('../middlewares/checkAdmin.js');
const checkDisabled = require('../middlewares/checkDisabled.js');

const PropertyController = require('../controllers/property.js');

// 响应默认带有code、msg

// 新建或编辑产权信息 请求：_id（编辑）、propertyName、summary、detail、isPublish、isSelt、isDisabled、createTime、editTime
router.post('/property', checkToken, checkEmail, checkDisabled, PropertyController.postProperty);
// 获取产权信息详情
router.get('/property', checkToken, PropertyController.getProperty);
// 获取产权信息列表
router.get('/propertys', checkToken, PropertyController.getPropertys);
// // 登录状态 请求：无 响应：isLogin、isAdmin、username
// router.get('/userStatus', UserController.userStatus);
// // 退出登录 请求：无 响应：无
// router.post('/logout', UserController.logout);
// //需要先检查权限的路由
// // 获取用户信息 请求：无 响应：user_id、username、email、telephone、qqNumber、wechat、message、emailConfirmation、isDisabled、createTime
// router.get('/userInfo', checkToken, UserController.getUserInfo);
// // 修改用户信息 请求：username、telephone、qqNumber、wechat、message
// router.post('/userInfo', checkToken, checkEmail, checkDisabled, UserController.postUserInfo);
// // 重新发送验证邮件 请求：无 
// router.get('/resendEmail', checkToken, UserController.resendEmail);
// // 对验证邮件链接进行验证 请求：token
// router.post('/checkEmailToken', UserController.checkEmailToken);
// // 修改密码
// router.post('/changePass', checkToken, UserController.changePassword);
// // 修改邮箱
// router.post('/changeEmail', checkToken, UserController.changeEmail);
// // 忘记密码 请求：email
// router.post('/forgetPass', UserController.forgetPassword);
// // 重置密码1 请求：token
// router.post('/resetPass1', UserController.resetPassword1);
// // 重置密码2 请求：token、password
// router.post('/resetPass2', UserController.resetPassword2);
// // 获取所有用户信息
// router.get('/usersInfo', checkToken, checkAdmin, UserController.getAllUsers);
// router.post('/delUser', checkToken, UserController.delUser);

module.exports = router