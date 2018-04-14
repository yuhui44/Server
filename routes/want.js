const router = require('koa-router')();
const config = require('../configs');
router.prefix(config.app.routerBaseApi);

// 中间件
const checkToken = require('../middlewares/checkToken.js');
const checkEmail = require('../middlewares/checkEmail.js');
const checkAdmin = require('../middlewares/checkAdmin.js');
const checkDisabled = require('../middlewares/checkDisabled.js');

const WantController = require('../controllers/want.js');

// 响应默认带有code、msg

// 提交交易意向 请求：property、message 
router.post('/indexWant', checkToken, checkEmail, checkDisabled, WantController.postWant);
// 查询收到的意向信息 请求：_id（可选）
router.get('/wants', checkToken, WantController.getWants);
// 查询发出的意向信息
router.get('/needs', checkToken, WantController.getNeeds);
// 管理员查询所有的意向信息
router.get('/allWants', checkToken, checkAdmin, WantController.getAllWants);
module.exports = router
