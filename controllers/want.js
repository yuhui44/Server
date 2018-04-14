const Want = require('../models/want.js');
const Property = require('../models/property.js');
const config = require('../configs');

// 配置邮件服务器
const nodemailer = require('nodemailer');
let transporter = nodemailer.createTransport(config.email);

// 发送意向消息邮件 参数：接收者邮箱 接收者用户名 发送者用户名 发送者邮箱 发送者留言
const sendEmail = async (toEmail, toUsername, fromEmail, fromUsername, message, propertyName) => {
  let mailOptions = {
    from: '"知识产权交易平台" <' + config.email.auth.user + '>',
    to: toEmail,
    subject: '“' + propertyName + '”有新的意向消息！',
    html: '<p>' + toUsername + '：</p><p>　　您的知识产权“' + propertyName + '”接收到了来自“' + fromUsername + '”用户的意向信息，留言信息为：“' + message + '”，它的邮箱为：“' + fromEmail + '”，请及时与对方取得联系。更多详细信息请登录个人中心查看：<a href="' + config.myPropertysLink + '" target="_blank">我的转让<a>。</p><p style="text-align: right;">知识产权交易平台</p>' 
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    }
  });
}

class WantController {
  static async postWant(ctx) {
    // 如果参数不包含留言
    if (!ctx.request.body.message) {
      ctx.status = 401;
      ctx.body = {
        code: 6,
        msg: '请求需要带有留言！'
      };
      return;
    }
    // 如果参数不包含产权id
    if (!ctx.request.body.property) {
      ctx.status = 401;
      ctx.body = {
        code: 6,
        msg: '请求需要带有产权ID！'
      };
      return;
    }
    // 对产权进行初步验证
    if (!/^[0-9a-fA-F]{24}$/.test(ctx.request.body.property)) {
      ctx.status = 401;
      ctx.body = {
        code: 6,
        msg: '产权ID有误！'
      };
      return;
    }
    // 查找该产权
    let result = await Property
      .findOne({
        _id: ctx.request.body.property,
        isDelete: false,
        isPublish: true,
        isSelt: false,
        isDisabled: false
      })
      .populate({
        path: 'publisher',
        select: 'email username'
      })
      .select('publisher propertyName')
      .exec()
      .catch(err => {
        ctx.throw(500, 'find property_id error');
      });
    // 查找不到产权
    if (!result) {
      ctx.status = 401;
      ctx.body = {
        code: 6,
        msg: '意向产权不存在！'
      };
      return;
    }
    if (result.publisher.equals(ctx.request.user._id)) {
      ctx.status = 401;
      ctx.body = {
        code: 6,
        msg: '不可向自己的产权信息发送意向请求！'
      };
      return;
    }
    // 意向是否已存在
    let result2 = await Want
      .findOne({
        property: ctx.request.body.property,
        wanter: ctx.request.user._id,
        isDelete: false
      })
      .exec()
      .catch(err => {
        ctx.throw(500, 'find want error');
      });
    if (result2) {
      ctx.status = 401;
      ctx.body = {
        code: 6,
        msg: '不可重复发送意向！'
      };
      return;
    }
    let want = new Want({
      property: ctx.request.body.property,
      message: ctx.request.body.message || '',
      wanter: ctx.request.user._id,
      keeper: result.publisher,
      isDelete: false,
      createTime: new Date()
    });
    await want
      .save()
      .catch(err => {
        ctx.throw(500, 'write new want error');
      });
    ctx.status = 200;
    ctx.body = {
      code: 2,
      msg: '请求意向提交成功！'
    };
    // 向产权所有者发送邮件
    // console.log(ctx.request.user);
    await sendEmail( result.publisher.email, result.publisher.username, ctx.request.user.email, ctx.request.user.username, ctx.request.body.message, result.propertyName );
  };

  // 查询产权的意向情况 俩功能：一、查询所有接收到的产权 二、查询某产权接收到的意向
  static async getWants(ctx) {
    // 为管理员提供特殊的存在id的意向查询方法
    if (ctx.request.user.isAdmin && ctx.request.query._id) {
      let doc = await Want
        .find({
          property: ctx.request.query._id,
          isDelete: false
        })
        .populate({
          path: 'wanter',
          select: 'username email isDisabled qqNumber telephone wechat'
        })
        .select('message wanter createTime')
        .exec()
        .catch(err => {
          ctx.throw(500, 'find all propertys error');
        });
      if (!doc) {
        ctx.status = 200;
        ctx.body = {
          code: 4,
          msg: '当前没有需求者！'
        };
        return;
      }
      if ( doc.length === 0 ) {
        ctx.status = 200;
        ctx.body = {
          code: 4,
          msg: '当前没有需求者！'
        };
        return;
      }
      ctx.status = 200;
      ctx.body = {
        code: 1,
        msg: '获取产权意向信息成功！',
        wants: doc
      };
      return;
    }
    // 非管理员查询某一产权的意向列表
    if (ctx.request.query._id) {
      let doc = await Want
        .find({
          property: ctx.request.query._id,
          keeper: ctx.request.user._id,
          isDelete: false
        })
        .populate({
          path: 'wanter',
          select: 'username email isDisabled qqNumber telephone wechat'
        })
        .select('message wanter createTime')
        .exec()
        .catch(err => {
          ctx.throw(500, 'find all propertys error');
        });
      if (!doc) {
        ctx.status = 200;
        ctx.body = {
          code: 4,
          msg: '当前没有需求者！'
        };
        return;
      }
      // 对禁用账号进行筛选
      let doc2= [];
      doc.forEach( item => {
        if ( !item.wanter.isDisabled ) {
          doc2.push( item );
        }
      } );
      if ( doc2.length === 0 ) {
        ctx.status = 200;
        ctx.body = {
          code: 4,
          msg: '当前没有需求者！'
        };
        return;
      }
      ctx.status = 200;
      ctx.body = {
        code: 1,
        msg: '获取产权意向信息成功！',
        wants: doc2
      };
      return;
    }
    // 用户获取收到的所有意向信息
    if (!ctx.request.query._id) {
      let doc = await Want
        .find({
          keeper: ctx.request.user._id,
          isDelete: false
        })
        .populate([
          {
            path: 'wanter',
            select: 'username email isDisabled qqNumber telephone wechat'
          },
          {
            path: 'property',
            select: 'propertyName isSelt'
          }
        ])
        .select('message wanter createTime property')
        .exec()
        .catch(err => {
          ctx.throw(500, 'find all propertys error');
        });
      if (!doc) {
        ctx.status = 200;
        ctx.body = {
          code: 4,
          msg: '当前没有需求者！'
        };
        return;
      }
      // 筛掉wanter被禁用和被卖出的
      let doc2= [];
      doc.forEach( item => {
        if ( !item.wanter.isDisabled && !item.property.isSelt ) {
          doc2.push( item );
        }
      } );
      if ( doc2.length === 0 ) {
        ctx.status = 200;
        ctx.body = {
          code: 4,
          msg: '当前没有需求者！'
        };
        return;
      }
      ctx.status = 200;
      ctx.body = {
        code: 1,
        msg: '获取产权意向信息成功！',
        wants: doc2
      };
      return;
    }
  };
  // 查看发出去的请求信息
  static async getNeeds(ctx) {
    let doc = await Want
      .find({
        wanter: ctx.request.user._id,
        isDelete: false
      })
      .populate([
        {
          path: 'keeper',
          select: 'username isDisabled'
        },
        {
          path: 'property',
          select: 'propertyName isSelt isDisabled isPublish'
        }
      ])
      .select('message keeper property createTime')
      .exec()
      .catch(err => {
        ctx.throw(500, 'find all propertys error');
      });
    if (!doc) {
      ctx.status = 200;
      ctx.body = {
        code: 4,
        msg: '还未发出过交易意向！'
      };
      return;
    }
    // 筛掉wanter被禁用和被卖出的
    let doc2= [];
    doc.forEach( item => {
      if ( !item.keeper.isDisabled && !item.property.isSelt && !item.property.isDisabled && item.property.isPublish ) {
        doc2.push( item );
      }
    } );
    if ( doc2.length === 0 ) {
      ctx.status = 200;
      ctx.body = {
        code: 4,
        msg: '还未发出过交易意向！'
      };
      return;
    }
    ctx.status = 200;
    ctx.body = {
      code: 1,
      msg: '获取产权意向信息成功！',
      needs: doc2
    };
    return;
  };
  // 查看发出去的请求信息
  static async getAllWants(ctx) {
    let doc = await Want
      .find({
        isDelete: false
      })
      .populate([
        {
          path: 'keeper',
          select: 'username email isDisabled qqNumber telephone wechat'
        },
        {
          path: 'wanter',
          select: 'username email isDisabled qqNumber telephone wechat'
        },
        {
          path: 'property',
          select: 'propertyName isSelt isDisabled isPublish'
        }
      ])
      .select('message keeper wanter property createTime')
      .exec()
      .catch(err => {
        ctx.throw(500, 'find all propertys error');
      });
    if (!doc) {
      ctx.status = 200;
      ctx.body = {
        code: 4,
        msg: '还未发出过交易意向！'
      };
      return;
    }
    if ( doc.length === 0 ) {
      ctx.status = 200;
      ctx.body = {
        code: 4,
        msg: '平台没有交易意向！'
      };
      return;
    }
    ctx.status = 200;
    ctx.body = {
      code: 1,
      msg: '获取意向信息成功！',
      wants: doc
    };
    return;
  };
};
exports = module.exports = WantController;