// models/user.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: { type: String, unique: true },
  name: String,
  password: String,
  phone: String,
  address: String,
  role: { type: String, default: "user" }
});

module.exports = mongoose.model('User', userSchema);
