
const express = require('express');
const router = express.Router();
const Service = require('../models/services');
const Bid = require('../models/bids');
const Product = require('../models/products');
const Order = require('../models/orders');


// Create a new service
router.post('/create', async (req, res) => {
    try {
        const {
            USER_ID,
            TITLE,
            BUDGET,
            DURATION,
            EXPERIENCE,
            TYPE,
            SKILLS,
            LOCATION,
            DESCRIPTION,
        } = req.body;
        const service = new Service({
            USER_ID,
            TITLE,
            BUDGET,
            DURATION,
            EXPERIENCE,
            TYPE,
            SKILLS,
            LOCATION,
            DESCRIPTION,
        });
        await service.save();
        res.status(201).json({ message: 'Service posted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET all service with pagination, searching, and filtering
router.get('/', async (req, res) => {
    try {
      const { page = 1, limit = 100, search, filterType, filterSkills} = req.query;
      const skip = (page - 1) * limit;
  
      const query = {};
  
      if (search) {
        const orConditions = [
          { TITLE: { $regex: new RegExp(search, 'i') } },
          { TYPE: { $regex: new RegExp(search, 'i') } },
          { SKILLS: { $regex: new RegExp(search, 'i') } },
          { LOCATION: { $regex: new RegExp(search, 'i') } },
        ];
      
      
        query.$or = orConditions;
      }
  
      if (filterType) {
        query.TYPE = filterType;
      }
  
      if (filterSkills) {
        query.SKILLS = filterSkills;
      }
  
  
      const services = await Service.find(query)
        .skip(skip)
        .limit(limit)
        .populate('USER_ID', 'name');
  
      const totalServices = await Service.countDocuments(query);
  
      res.json({
        success: true,
        currentPage: page,
        totalPages: Math.ceil(totalServices / limit),
        totalServices: totalServices, // Total Services in the database
        servicesOnCurrentPage: services.length,
        services,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

// Delete a Service by Service ID
router.delete('/:serviceId', async (req, res) => {
    try {
        const { serviceId } = req.params;
        const deletedService = await Service.findByIdAndDelete(serviceId);
        if (!deletedService) {
            return res.status(404).json({ message: 'Service not found' });
        }
        res.json({ message: 'Service deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a Service by Service ID
router.put('/:serviceId', async (req, res) => {
    try {
        const { serviceId } = req.params;
        const updatedFields = req.body; // Get all the fields to update from the request body

        const updatedService = await Service.findByIdAndUpdate(
            serviceId,
            { $set: updatedFields }, // Use $set to update only the provided fields
            { new: true }
        );

        if (!updatedService) {
            return res.status(404).json({ message: 'Service not found' });
        }

        res.json({ message: 'Service updated successfully', service: updatedService });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// View a single Service by Service ID
router.get('/:serviceId', async (req, res) => {
    try {
        const { serviceId } = req.params;
        const Service = await Service.findById(serviceId);
        if (!Service) {
            return res.status(404).json({ message: 'Service not found' });
        }
        res.json({ Service });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route for fetching all services by a user
router.get('/servicebyuser/:userId', async (req, res) => {
    try {
      const userId = req.params.userId;
  
      // Find all services belonging to the user
      const services = await Service.find({ USER_ID: userId })
        .sort({ createdAt: -1 }) // Sort by creation date, descending
        .exec();
  
      res.status(200).json(services);
    } catch (error) {
      // Handling errors
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

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