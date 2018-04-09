const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const propertySchema = new Schema({
  propertyName: String,
  summary: String,
  detail: String,
  publisher: { type: Schema.Types.ObjectId, ref: 'user'},
  // sources: String,
  isPublish: {type: Boolean, default: true},
  isSelt: {type: Boolean, default: false},
  // isThird: {type: Boolean, default: false},
  // isClaimed: {type: Boolean, default: false},
  isDisabled: {type: Boolean, default: false},
  isDelete: {type: Boolean, default: false},
  createTime: {type: Date, default: Date.now},
  editTime: {type: Date, default: Date.now}
});

exports = module.exports = mongoose.model('property', propertySchema);
