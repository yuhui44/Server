const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const wantSchema = new Schema({
  property: { type: Schema.Types.ObjectId, ref: 'property'},
  wanter: { type: Schema.Types.ObjectId, ref: 'user'},
  keeper: { type: Schema.Types.ObjectId, ref: 'user'},
  message: {type: String, default: '' },
  isDelete: {type: Boolean, default: false},
  createTime: {type: Date, default: Date.now}
});

exports = module.exports = mongoose.model('want', wantSchema);