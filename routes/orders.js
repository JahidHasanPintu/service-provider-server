// Import required modules
const express = require('express');
const router = express.Router();
const Order = require('../models/orders');
const Product = require('../models/products');
const User = require('../models/user');

// Route for fetching orders with pagination and search
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, email, phone, productName } = req.query;
    // Building query for search
    const searchQuery = {};
    if (email) searchQuery['shippingAddress.email'] = { $regex: email, $options: 'i' };
    if (phone) searchQuery['shippingAddress.phone'] = { $regex: phone, $options: 'i' };
    if (productName) {
      const products = await Product.find({ productName: { $regex: productName, $options: 'i' } }, '_id');
      searchQuery.prodID = { $in: products.map(product => product._id) };
    }

    // Fetching orders with pagination and search
    const orders = await Order.find(searchQuery)
    .populate({
      path: 'userID',
      select: 'name email', // Selecting name and email from User model
      model: 'User'
    })
      .populate({
        path: 'prodID',
        select: 'productName imageLinks', // Selecting productName and imageLinks from Product model
        model: 'Product'
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Count total number of orders for pagination
    const count = await Order.countDocuments(searchQuery);

    // Sending response
    res.status(200).json({
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      orders
    });
  } catch (error) {
    // Handling errors
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
// Route for creating a new order
router.post('/create', async (req, res) => {
  try {
    const { userID, prodID,shippingCharge,subtotal,total,notes,shippingAddress, paymentMethod, paymentStatus } = req.body;
    const newOrder = new Order({
      userID,
      prodID,
      shippingCharge,
      subtotal,
      total,
      notes,
      shippingAddress,
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

// Route for deleting an order by ID
router.delete('/delete/:orderId', async (req, res) => {
  try {
    const orderId = req.params.orderId;

    // Check if the order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Delete the order
    await Order.findByIdAndDelete(orderId);

    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    // Handling errors
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route for updating orderStatus and paymentStatus by order ID
router.put('/update/:orderId', async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const { orderStatus, paymentStatus } = req.body;

    // Check if the order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update orderStatus and paymentStatus
    if (orderStatus !== undefined) {
      order.orderStatus = orderStatus;
    }
    if (paymentStatus !== undefined) {
      order.paymentStatus = paymentStatus;
    }

    // Save the updated order
    await order.save();

    res.status(200).json({ message: 'Order updated successfully', order });
  } catch (error) {
    // Handling errors
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route for fetching orders placed by a user
router.get('/orderbyuser/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Fetch orders placed by the user
    const orders = await Order.find({ userID: userId })
      .populate('prodID', 'productName imageLinks') // Populate product details
      .sort({ createdAt: -1 })
      .exec();

    res.status(200).json(orders);
  } catch (error) {
    // Handling errors
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route for fetching orders placed by a user who uploaded specific products
router.get('/orderbyowner/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find products uploaded by the user
    const products = await Product.find({ USER_ID: userId }, '_id');

    // Extract product IDs
    const productIds = products.map(product => product._id);

    // Fetch orders containing these products
    const orders = await Order.find({ prodID: { $in: productIds } })
      .populate('prodID', 'productName imageLinks') // Populate product details
      .sort({ createdAt: -1 })
      .exec();

    res.status(200).json(orders);
  } catch (error) {
    // Handling errors
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
