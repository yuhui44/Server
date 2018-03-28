const router = require('koa-router')();
const config = require('../configs');
router.prefix(config.app.routerBaseApi);

//checkToken作为中间件存在
const checkToken = require('../middlewares/checkToken.js');

const UserController = require('../controllers/user.js');

router.post('/login', UserController.login);
//用户注册 参数：code、msg、
router.post('/register', UserController.register);


//需要先检查权限的路由
router.get('/user', checkToken, UserController.getAllUsers);
router.post('/delUser', checkToken, UserController.delUser);

module.exports = router
