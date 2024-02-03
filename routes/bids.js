const express = require('express');
const router = express.Router();
const Bids = require('../models/bids');
const User = require('../models/user');
const Service = require('../models/services');

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, serviceId } = req.query;
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
// router.get('/all-bids', async (req, res) => {
//   try {
//     const { page = 1, limit = 10 } = req.query;
//     const skip = (page - 1) * limit;

//     const query = {};
//     const bids = await Bids.find(query)
//       .skip(skip)
//       .limit(limit)
//       .populate('USER_ID', 'name');

//     const totalBids = await Bids.countDocuments(query);

//     res.json({
//       currentPage: page,
//       totalPages: Math.ceil(totalBids / limit),
//       totalBids: totalBids, // Total Services in the database
//       bidsOnCurrentPage: bids.length,
//       bids,
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

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

router.get('/all-bids', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    const bids = await Bids.find(query)
      .sort({ createdAt: -1 }) // Sort by createdAt in descending order (recent first)
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'USER_ID',
        select: 'name',
      })
      .populate({
        path: 'SERVICE_ID',
        select: 'TITLE',
        model: Service,
      });

    const totalBids = await Bids.countDocuments(query);

    res.json({
      success:"true",
      currentPage: page,
      totalPages: Math.ceil(totalBids / limit),
      totalBids: totalBids,
      bidsOnCurrentPage: bids.length,
      bids,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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

// Route for updating the status of a bid
router.put('/update/:bidId', async (req, res) => {
  try {
    const bidId = req.params.bidId;
    const { status } = req.body;

    // Check if the bid exists
    const bid = await Bids.findById(bidId);
    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    // Update the status of the bid
    bid.STATUS = status || bid.STATUS;

    // Save the updated bid
    await bid.save();

    res.status(200).json({ message: 'Bid status updated successfully', bid });
  } catch (error) {
    // Handling errors
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route for fetching all bids by USER_ID
router.get('/bidsbyuser/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find all bids by USER_ID
    const bids = await Bids.find({ USER_ID: userId })
      .sort({ createdAt: -1 }) // Sort by creation date, descending
      .exec();

    res.status(200).json(bids);
  } catch (error) {
    // Handling errors
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


module.exports = router;