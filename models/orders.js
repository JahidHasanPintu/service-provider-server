// models/order.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  prodID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  quantity: String,
  paymentMethod: String,
  paymentStatus: String,
  orderStatus: { type: String, default: "pending" },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Order', orderSchema);
