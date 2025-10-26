// server/controllers/auth.controller.js
const User = require('../models/user.model');
const Restaurant = require('../models/restaurant.model');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('express-async-handler'); // For cleaner async error handling

// const twilio = require('twilio'); // Twilio is temporarily disabled (preserved as requested)
// const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);


const registerUser = asyncHandler(async (req, res) => {
  const { name, email, phone, password, role, restaurantDetails } = req.body;
  
  const userExists = await User.findOne({ $or: [{ email }, { phone }] });
  if (userExists) {
    res.status(400);
    throw new Error('User with this email or phone already exists.');
  }

  let newUser;
  if (role === 'admin') {
    if (!restaurantDetails) {
      res.status(400);
      throw new Error('Restaurant details are required for admin registration.');
    }
    // Process documents - only include non-empty values
    const documents = {};
    if (restaurantDetails.documents) {
      if (restaurantDetails.documents.fssaiLicense) {
        documents.fssaiLicense = restaurantDetails.documents.fssaiLicense;
      }
      if (restaurantDetails.documents.restaurantPhoto) {
        documents.restaurantPhoto = restaurantDetails.documents.restaurantPhoto;
      }
    }

    // Validate address fields
    if (!restaurantDetails.address || !restaurantDetails.address.street || 
        !restaurantDetails.address.city || !restaurantDetails.address.state || 
        !restaurantDetails.address.pincode) {
      res.status(400);
      throw new Error('Complete address (street, city, state, pincode) is required for restaurant registration.');
    }

    const newRestaurant = new Restaurant({
      name: restaurantDetails.name,
      description: restaurantDetails.description || '',
      address: {
        street: restaurantDetails.address.street,
        city: restaurantDetails.address.city,
        state: restaurantDetails.address.state,
        pincode: restaurantDetails.address.pincode,
        location: restaurantDetails.address.location || {
          type: 'Point',
          coordinates: [0, 0]
        }
      },
      cuisine: restaurantDetails.cuisine,
      averageRating: restaurantDetails.averageRating || 0,
      fssaiLicenseNumber: restaurantDetails.fssaiLicenseNumber,
      status: restaurantDetails.status || 'pending',
      documents: documents,
      menuItems: [], // Start with empty menu items
    });
    
    newUser = new User({ name, email, phone, password, role, restaurant: newRestaurant._id });
    newRestaurant.owner = newUser._id;

    await newRestaurant.save();
    await newUser.save();

  } else {
    newUser = await User.create({ name, email, phone, password, role });
  }

  if (newUser) {
    // --- THIS IS THE FIX ---
    // Pass the user's role to the token generator to create a role-specific cookie
    generateToken(res, newUser._id, newUser.role);
    // --- END OF FIX ---
    
    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data.');
  }
});

const loginUser = asyncHandler(async (req, res) => { 
  const { loginIdentifier, password } = req.body;
  const user = await User.findOne({
    $or: [{ email: loginIdentifier }, { phone: loginIdentifier }],
  });

  if (user && (await user.matchPassword(password))) {
    // --- THIS IS THE FIX ---
    // Pass the user's role to the token generator
    generateToken(res, user._id, user.role);
    // --- END OF FIX ---

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    });
  } else {
    res.status(401);
    throw new Error('Invalid credentials.');
  }
});

const forgotPassword = asyncHandler(async (req, res) => { 
  const { phone } = req.body;
  const user = await User.findOne({ phone });

  if (!user) {
    // We send a generic success message to prevent user enumeration attacks
    return res.status(200).json({ message: 'If a user with this phone number exists, an OTP has been sent.' });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiration = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  user.otp = otp;
  user.otpExpiration = otpExpiration;
  await user.save();
  
  // For development, we log the OTP. In production, this will be sent via Twilio.
  console.log(`--- Password Reset OTP for ${phone} is: ${otp} ---`);

  res.status(200).json({ message: 'OTP sent successfully.' });
});

const resetPassword = asyncHandler(async (req, res) => { 
  const { phone, otp, newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters long.');
  }

  const user = await User.findOne({
    phone,
    otp,
    otpExpiration: { $gt: Date.now() }, // Check if OTP is valid and not expired
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid OTP or OTP has expired.');
  }

  user.password = newPassword;
  user.otp = undefined;
  user.otpExpiration = undefined;
  await user.save();

  res.status(200).json({ message: 'Password has been reset successfully. Please log in.' });
});

const logoutUser = (req, res) => {
  // --- THIS IS THE FIX ---
  // To ensure a clean logout, clear all possible role-based cookies.
  res.cookie('jwt_customer', '', { httpOnly: true, expires: new Date(0) });
  res.cookie('jwt_admin', '', { httpOnly: true, expires: new Date(0) });
  res.cookie('jwt_superadmin', '', { httpOnly: true, expires: new Date(0) });
  // --- END OF FIX ---
  
  res.status(200).json({ message: 'Logged out successfully' });
};


module.exports = { 
  registerUser, 
  loginUser, 
  forgotPassword, 
  resetPassword,
  logoutUser
};