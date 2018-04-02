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
  isAdmin: {type: Boolean, default: false},
  emailConfirmation: {type: Boolean, default: false},
  isDisabled: {type: Boolean, default: false},
  isDelete: {type: Boolean, default: false},
  createTime: {type: Date, default: Date.now}
});

exports = module.exports = mongoose.model('user', userSchema);
