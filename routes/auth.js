// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email,name, password: hashedPassword , phone, address});
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login a user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Authentication failed' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Authentication failed' });
    }

    const token = jwt.sign({ userId: user._id }, 'password-secret', {
      expiresIn: '24h', // Token expires in 24 hour
    });

    res.status(200).json({message: "Login Successfull", user: user, access_token: token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/users', async (req, res) => {
  try {
      const { page, limit, search, filterRole } = req.query;
      const skip = (page - 1) * limit;

      const query = {};

      if (search) {
          const orConditions = [
              { email: { $regex: new RegExp(search, 'i') } },
              { name: { $regex: new RegExp(search, 'i') } },
              { phone: { $regex: new RegExp(search, 'i') } },
          ];

          query.$or = orConditions;
      }

      if (filterRole) {
          query.role = filterRole;
      }

      const users = await User.find(query)
          .skip(skip)
          .limit(limit); // Populate the 'USER_ID' field with 'name' from the User model

      const totalUsers = await User.countDocuments(query);

      res.json({
          success: "true",
          currentPage: page,
          totalPages: Math.ceil(totalUsers / limit),
          totalItem: totalUsers,
          usersOnCurrentPage: users.length,
          users,
      });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

router.put('/update/:userId', async (req, res) => {
  try {
      const { email, name, password, phone, address } = req.body;
      const updatedUser = await User.findByIdAndUpdate(
          req.params.userId,
          {
              $set: {
                  email,
                  name,
                  phone,
                  address,
                  
              },
          },
          { new: true }
      );

      if (!updatedUser) {
          return res.status(404).json({ message: 'User not found' });
      }

      res.json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});


router.delete('/delete/:userId', async (req, res) => {
  try {
      const deletedUser = await User.findByIdAndDelete(req.params.userId);

      if (!deletedUser) {
          return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({ message: 'User deleted successfully', deletedUser });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

module.exports = router;
