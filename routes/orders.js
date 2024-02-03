// Import required modules
const express = require('express');
const router = express.Router();
const Order = require('../models/orders');

// Route for creating a new order
router.post('/create', async (req, res) => {
  try {
    const { userID, prodID, quantity, paymentMethod, paymentStatus } = req.body;
    const newOrder = new Order({
      userID,
      prodID,
      quantity,
      paymentMethod,
      paymentStatus,
    });
    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    // Handling errors
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
