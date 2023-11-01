const express = require('express');
const router = express.Router();
const Bids = require('../models/bids');
const User = require('../models/user');

router.get('/', async (req, res) => {
    try {
      const { page = 1, limit = 10, serviceId} = req.query;
      const skip = (page - 1) * limit;
  
      const query = {};
  
      if (serviceId) {
        query.SERVICE_ID = serviceId;
      }
  
  
      const bids = await Bids.find(query)
        .skip(skip)
        .limit(limit)
        .populate('USER_ID', 'name');
  
      const totalBids = await Bids.countDocuments(query);
  
      res.json({
        currentPage: page,
        totalPages: Math.ceil(totalBids / limit),
        totalBids: totalBids, // Total Services in the database
        bidsOnCurrentPage: bids.length,
        bids,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

// View a single Service by Service ID
// router.get('/byService/:serviceId', async (req, res) => {
//     try {
//         const { serviceId } = req.params;
//         const Bids = await Bids.findById(serviceId);
//         if (!Bids) {
//             return res.status(404).json({ message: 'Bids not found' });
//         }
//         res.json({ Bids });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
//     // res.status(500).json({ msg: "Working" });
// });


// Create a new service
router.post('/create', async (req, res) => {
    try {
        const {
            USER_ID,
            SERVICE_ID,
            DETAILS,
            
        } = req.body;
        const bid = new Bids({
            USER_ID,
            SERVICE_ID,
            DETAILS,
        });
        await bid.save();
        res.status(201).json({ message: 'Bid placed successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;