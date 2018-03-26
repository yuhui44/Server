const router = require('koa-router')();
const config = require('../configs');
router.prefix(config.app.routerBaseApi);

//checkToken作为中间件存在
const checkToken = require('../middlewares/checkToken.js');

const UserController = require('../controllers/user.js');

router.post('/login', UserController.login);
router.post('/register', UserController.reg);

//需要先检查权限的路由
router.get('/user', checkToken, UserController.getAllUsers);
router.post('/delUser', checkToken, UserController.delUser);

module.exports = router