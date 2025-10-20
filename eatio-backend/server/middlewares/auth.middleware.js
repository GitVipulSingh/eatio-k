// server/middlewares/auth.middleware.js

const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/user.model');
const Restaurant = require('../models/restaurant.model');

const isAuthenticated = asyncHandler(async (req, res, next) => {
  let token;
  
  // --- THIS IS THE FIX ---
  // Check for each possible role-based cookie in a specific order.
  if (req.cookies.jwt_customer) {
    token = req.cookies.jwt_customer;
  } else if (req.cookies.jwt_admin) {
    token = req.cookies.jwt_admin;
  } else if (req.cookies.jwt_superadmin) {
    token = req.cookies.jwt_superadmin;
  }
  // --- END OF FIX ---

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Attach the user object to the request for subsequent middleware/controllers
      req.user = await User.findById(decoded.userId).select('-password');
      
      if (req.user) {
        next(); // User is authenticated, proceed to the next step
      } else {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }
    } catch (error) {
      res.status(401);
      throw new Error('Not authorized, token is invalid or has expired');
    }
  } else {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }
});

// This guard checks if the user is a regular admin AND their restaurant is approved.
const isRestaurantAdmin = asyncHandler(async (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        if (!req.user.restaurant) {
            res.status(403);
            throw new Error('Access Denied. Admin user is not associated with a restaurant.');
        }

        const restaurant = await Restaurant.findById(req.user.restaurant);

        if (restaurant && restaurant.status === 'approved') {
            next(); // Success!
        } else {
            res.status(403);
            throw new Error('Access Denied. Your restaurant is not yet approved.');
        }
    } else {
        res.status(403);
        throw new Error('Not authorized as a restaurant admin.');
    }
});

// This guard checks if the user is a superadmin.
const isSuperAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'superadmin') {
        next();
    } else {
        res.status(403);
        throw new Error('Not authorized as a superadmin.');
    }
};

module.exports = { isAuthenticated, isRestaurantAdmin, isSuperAdmin };