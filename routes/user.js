const router = require('koa-router')();
const config = require('../configs');
router.prefix(config.app.routerBaseApi);

// 中间件
const checkToken = require('../middlewares/checkToken.js');
const checkEmail = require('../middlewares/checkEmail.js');
const checkAdmin = require('../middlewares/checkAdmin.js');
const checkDisabled = require('../middlewares/checkDisabled.js');

const UserController = require('../controllers/user.js');

// 响应默认带有code、msg

// 用户登录 请求：account、password
router.post('/login', UserController.login);
// 用户注册 请求：username、email、password
router.post('/register', UserController.register);
// 登录状态 请求：无 响应：isLogin、isAdmin、username
router.get('/userStatus', UserController.userStatus);
// 退出登录 请求：无 响应：无
router.post('/logout', UserController.logout);
//需要先检查权限的路由
// 获取用户信息 请求：无 响应：user_id、username、email、telephone、qqNumber、wechat、message、emailConfirmation、isDisabled、createTime
router.get('/userInfo', checkToken, UserController.getUserInfo);
// 修改用户信息 请求：username、telephone、qqNumber、wechat、message
router.post('/userInfo', checkToken, checkEmail, UserController.postUserInfo);
// 重新发送验证邮件 请求：无 
router.get('/resendEmail', checkToken, UserController.resendEmail);
// 对验证邮件链接进行验证 请求：token
router.post('/checkEmailToken', UserController.checkEmailToken);
// 修改密码
router.post('/changePass', checkToken, UserController.changePassword);
// 修改邮箱
router.post('/changeEmail', checkToken, UserController.changeEmail);
// 忘记密码 请求：email
router.post('/forgetPass', UserController.forgetPassword);
// 重置密码1 请求：token
router.post('/resetPass1', UserController.resetPassword1);
// 重置密码2 请求：token、password
router.post('/resetPass2', UserController.resetPassword2);
// router.get('/user', checkToken, UserController.getAllUsers);
// router.post('/delUser', checkToken, UserController.delUser);

module.exports = router
