// routes/schools.js
const express = require('express');
const router = express.Router();
const Service = require('../models/services');

// Create a new school
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

// GET all schools with pagination, searching, and filtering
router.get('/', async (req, res) => {
    try {
      const { page = 1, limit = 10, search, filterType, filterLevel, filterDivision } = req.query;
      const skip = (page - 1) * limit;
  
      const query = {};
  
      if (search) {
        const orConditions = [
          { DISTRICT_NAME: { $regex: new RegExp(search, 'i') } },
          { THANA_NAME: { $regex: new RegExp(search, 'i') } },
          { INSTITUTE_NAME_NEW: { $regex: new RegExp(search, 'i') } },
          { LOCATION: { $regex: new RegExp(search, 'i') } },
        ];
      
        // Check if search is a valid number and then apply to EIIN field
        if (!isNaN(search)) {
          orConditions.push({ EIIN: search });
        }
      
        query.$or = orConditions;
      }
  
      if (filterType) {
        query.TYP = filterType;
      }
  
      if (filterLevel) {
        query.LVL = filterLevel;
      }
  
      if (filterDivision) {
        query.DIVISION_NAME = filterDivision;
      }
  
      const schools = await School.find(query)
        .skip(skip)
        .limit(limit);
  
      const totalSchools = await School.countDocuments(query);
  
      res.json({
        currentPage: page,
        totalPages: Math.ceil(totalSchools / limit),
        totalSchools: totalSchools, // Total schools in the database
        schoolsOnCurrentPage: schools.length,
        schools,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

// Delete a school by school ID
router.delete('/:schoolId', async (req, res) => {
    try {
        const { schoolId } = req.params;
        const deletedSchool = await School.findByIdAndDelete(schoolId);
        if (!deletedSchool) {
            return res.status(404).json({ message: 'School not found' });
        }
        res.json({ message: 'School deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a school by school ID
router.put('/:schoolId', async (req, res) => {
    try {
        const { schoolId } = req.params;
        const updatedFields = req.body; // Get all the fields to update from the request body

        const updatedSchool = await School.findByIdAndUpdate(
            schoolId,
            { $set: updatedFields }, // Use $set to update only the provided fields
            { new: true }
        );

        if (!updatedSchool) {
            return res.status(404).json({ message: 'School not found' });
        }

        res.json({ message: 'School updated successfully', school: updatedSchool });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// View a single school by school ID
router.get('/:schoolId', async (req, res) => {
    try {
        const { schoolId } = req.params;
        const school = await School.findById(schoolId);
        if (!school) {
            return res.status(404).json({ message: 'School not found' });
        }
        res.json({ school });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;