const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
  USER_ID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Make sure 'User' matches the model name of your User schema
  },
  productName: String,
  quantity: String,
  price: String,
  imageLinks: String, // Assuming a comma-separated list of image links, you might want to use an array for multiple images
  category: String,
  brand: String,
  description: String, 
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Product', productSchema);
