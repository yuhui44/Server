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
// 获取产权信息详情 请求：_id
router.get('/property', checkToken, PropertyController.getProperty);
// 获取产权信息列表
router.get('/propertys', checkToken, PropertyController.getPropertys);
// 管理员获取所有产权信息列表
router.get('/allPropertys', checkToken, checkAdmin, PropertyController.getAllPropertys);
// 首页获取产权列表
router.get('/indexPropertys', PropertyController.indexPropertys);
// 首页获取产权详情 参数：_id
router.get('/indexProperty', PropertyController.indexProperty);
module.exports = router
