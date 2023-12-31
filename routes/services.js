
const express = require('express');
const router = express.Router();
const Service = require('../models/services');

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
      const { page = 1, limit = 10, search, filterType, filterSkills} = req.query;
      const skip = (page - 1) * limit;
  
      const query = {};
  
      if (search) {
        const orConditions = [
          { TITLE: { $regex: new RegExp(search, 'i') } },
          { TYPE: { $regex: new RegExp(search, 'i') } },
          { SKILLS: { $regex: new RegExp(search, 'i') } },
          { DESCRIPTION: { $regex: new RegExp(search, 'i') } },
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

module.exports = router;