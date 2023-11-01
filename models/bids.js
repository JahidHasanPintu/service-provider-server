
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bidsSchema = new Schema({
  USER_ID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Make sure 'User' matches the model name of your User schema
  },
  SERVICE_ID: String,
  DETAILS: String,
  createdAt: {
    type: Date,
    default: Date.now // Automatically set to the current timestamp
  }
});

module.exports = mongoose.model('Bids', bidsSchema);
