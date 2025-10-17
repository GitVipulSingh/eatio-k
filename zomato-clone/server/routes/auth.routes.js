// server/routes/auth.routes.js

const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  logoutUser, // <-- Import new function
} = require('../controllers/auth.controller');

// Temporarily disabled for development
// router.post('/send-registration-otp', sendRegistrationOtp); 

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/logout', logoutUser); // <-- Add new route

module.exports = router;
