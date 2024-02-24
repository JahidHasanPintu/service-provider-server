
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const serviceSchema = new Schema({
 USER_ID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Make sure 'User' matches the model name of your User schema
  },
  TITLE: String,
  BUDGET: String,
  DURATION: String,
  EXPERIENCE: String,
  TYPE: String,
  SKILLS: String,
  LOCATION: String,
  DESCRIPTION: String,
  createdAt: {
    type: Date,
    default: Date.now // Automatically set to the current timestamp
  }
});

module.exports = mongoose.model('Service', serviceSchema);
