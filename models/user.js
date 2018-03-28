const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: String,
  username: String,
  password: String,
  telephone: String,
  qqNumber: String,
  wechat: String,
  message: {type: Boolean, default: false},
  isAddmin: {type: Boolean, default: false},
  emailConfirmation: {type: Boolean, default: false},
  isDisabled: {type: Boolean, dafault: false},
  isDelete: {type: Boolean, default: false},
  create_time: {type: Date, default: Date.now},
  //状态代码： 1.正常 2.邮箱未验证 3.账号被停用 4.账号已删除
  status: { type: Number, min: 1, max: 4 }
});

exports = module.exports = mongoose.model('user', userSchema);
