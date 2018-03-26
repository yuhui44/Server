const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: String,
  username: String,
  password: String,
  create_time: Date
});

exports = module.exports = mongoose.model('user', userSchema);
