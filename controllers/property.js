const Property = require('../models/property.js');

const UserController = require('../controllers/user.js');

class PropertyController {
  //发布新的产权信息
  static async postProperty(ctx) {
    // 如果请求不含_id，新建产权信息
    if (!ctx.request.body._id) {
      // 存在产权名、摘要和详情
      if (ctx.request.body.propertyName && ctx.request.body.summary && ctx.request.body.detail) {
        let property = new Property({
          propertyName: ctx.request.body.propertyName,
          summary: ctx.request.body.summary,
          detail: ctx.request.body.detail,
          isPublish: ctx.request.body.isPublish || true,
          isSelt: ctx.request.body.isSelt,
          createTime: new Date(),
          editTime: new Date(),
          publisher: ctx.request.user._id
        });
        let result = await property
          .save()
          .catch(err => {
            ctx.throw(500, 'write new property error');
          });
        await UserController.setUserAddProperty(ctx.request.user._id, result._id);
        ctx.status = 200;
        ctx.body = {
          code: 2,
          msg: '产权信息提交成功！'
        };
      } else {
        // 信息不全
        ctx.status = 401;
        ctx.body = {
          code: 6,
          msg: '产权信息不完整！'
        };
      }
      // 存在产权id，编辑产权信息
    } else {
      let propertyInfo = {};
      if ( ctx.request.body.propertyName ) {
        propertyInfo.propertyName = ctx.request.body.propertyName;
      }
      if ( ctx.request.body.summary ) {
        propertyInfo.summary = ctx.request.body.summary;
      }
      if ( ctx.request.body.detail ) {
        propertyInfo.detail = ctx.request.body.detail;
      }
      if ( ctx.request.body.isPublish !== null ) {
        propertyInfo.isPublish = ctx.request.body.isPublish;
      }
      if ( ctx.request.body.isSelt !== null ) {
        propertyInfo.isSelt = ctx.request.body.isSelt;
      }
      if ( ctx.request.user.isAdmin ) {
        if ( ctx.request.body.isDisabled !== null ) {
          propertyInfo.isDisabled = ctx.request.body.isDisabled;
        }
        if ( ctx.request.body.createTime ) {
          propertyInfo.createTime = ctx.request.body.createTime;
        }
        if ( ctx.request.body.editTime ) {
          propertyInfo.editTime = ctx.request.body.editTime;
        }
      }
      // 查找该ID
      let result = await Property
        .findOne({
          _id: ctx.request.body._id,
          isDelete: false
        })
        .exec()
        .catch(err => {
          ctx.throw(500, 'find property_id error');
        });
      // 查找不到产权
      if (!result) {
        ctx.status = 401;
        ctx.body = {
          code: 6,
          msg: '产权信息不存在！'
        };
        return;
      }
      if ( ctx.request.user.isAdmin || ctx.request.user._id.equals( result.publisher ) ) {
        await Property
          .findByIdAndUpdate(ctx.request.body._id, propertyInfo)
          .exec()
          .catch(err => {
            ctx.throw(500, 'write property info error');
          });
        ctx.status = 200;
        ctx.body = {
          code: 2,
          msg: '产权信息修改成功'
        };
        return;
      }
      ctx.status = 401;
      ctx.body = {
        code: 6,
        msg: '不可修改他人产权信息！'
      };
      return;
    }
  };
  static async getPropertys(ctx) {
    //查询当前用户所有的产权信息
    let doc = await Property
      .find({
        publisher: ctx.request.user._id,
        isDelete: false
      })
      .select('propertyName summary isPublish isSelt isDisable createTime editTime')
      .exec()
      .catch(err => {
        ctx.throw(500, 'find all propertys error');
      });
    if (!doc) {
      ctx.status = 401;
      ctx.body = {
        code: 4,
        msg: '当前未发布产权！'
      };
      return;
    }
    ctx.status = 200;
    ctx.body = {
      code: 1,
      msg: '获取所有产权信息成功！',
      propertys: doc
    };
  };
  //查询产权信息详情
  static async getProperty(ctx) {
    //如果请求参数不含有产权ID
    if (!ctx.request.query._id) {
      ctx.status = 401;
      ctx.body = {
        code: 6,
        msg: '请求必须参数缺少产权ID！'
      };
      return;
    }
    //如果是管理员（拿到多一点信息）
    if (ctx.request.user.isAdmin) {
      // 进行查找
      let result = await Property
        .findOne({
          _id: ctx.request.query._id,
          isDelete: false
        })
        .populate({
          path: 'publisherName',
          match: { 'isDelete': false },
          select: '-isDelete'
        })
        .select('propertyName summary detail publisher isPublish isSelt isDisable createTime editTime publisherName')
        .exec()
        .catch(err => {
          ctx.throw(500, 'find property_id error');
        });
      // 查找不到产权
      if (!result) {
        ctx.status = 401;
        ctx.body = {
          code: 6,
          msg: '产权信息不存在！'
        };
        return;
      }
      ctx.status = 200;
      ctx.body = {
        code: 1,
        msg: '成功获取产权信息！',
        property: result
      };
      //如果不是管理员
    } else {
      // 进行查找
      let result = await Property
        .findOne({
          _id: ctx.request.query._id,
          isDelete: false
        })
        .select('propertyName summary detail isPublish isSelt publisher')
        .exec()
        .catch(err => {
          ctx.throw(500, 'find property_id error');
        });
      // 查找不到产权
      if (!result) {
        ctx.status = 401;
        ctx.body = {
          code: 6,
          msg: '产权信息不存在！'
        };
        return;
      }
      // 产权所有者非请求者
      if ( ! result.publisher.equals( ctx.request.user._id ) ) {
        ctx.status = 401;
        ctx.body = {
          code: 6,
          msg: '不可获取他人产权信息！'
        };
        return;
      }
      ctx.status = 200;
      ctx.body = {
        code: 1,
        msg: '成功获取产权信息！',
        property: result
      };
      return;
    }
  };
};
exports = module.exports = PropertyController;