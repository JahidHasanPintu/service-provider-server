
const express = require('express');
const router = express.Router();
const Service = require('../models/services');
const Bid = require('../models/bids');
const Product = require('../models/products');
const Order = require('../models/orders');
  router.get('/totals', async (req, res) => {
    try {
      const bidCount = await Bid.countDocuments();
      const orderCount = await Order.countDocuments();
      const productCount = await Product.countDocuments();
      const serviceCount = await Service.countDocuments();
  
      res.json({
        bidCount,
        orderCount,
        productCount,
        serviceCount
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

module.exports = router;