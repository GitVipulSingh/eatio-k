// server/controllers/user.controller.js

const User = require('../models/user.model');
const asyncHandler = require('express-async-handler');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  // The user object is attached to the request in the `isAuthenticated` middleware.
  // We re-fetch it here to ensure we have the most up-to-date document.
  const user = await User.findById(req.user._id);

  if (user) {
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email, // <-- FIX: Added the email field
      phone: user.phone,
      role: user.role,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

module.exports = { getUserProfile };