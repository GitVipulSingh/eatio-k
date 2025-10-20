// server/routes/admin.routes.js

const express = require('express');
const router = express.Router();
const {
  getPendingRestaurants,
  updateRestaurantStatus,
  updateOrderStatus,
  getRestaurantOrders,
  getSystemStats,
  getAllRestaurants,
  getAllUsers,
  getAllOrders,
  updateRestaurantOpenStatus,
} = require('../controllers/admin.controller');

const {
  isAuthenticated,
  isSuperAdmin,
  isRestaurantAdmin,
} = require('../middlewares/auth.middleware');

// --- Super Admin Routes ---
router.get('/restaurants/pending', isAuthenticated, isSuperAdmin, getPendingRestaurants);
router.put('/restaurants/:id/status', isAuthenticated, isSuperAdmin, updateRestaurantStatus);

// System statistics and data routes
router.get('/stats', isAuthenticated, isSuperAdmin, getSystemStats);
router.get('/restaurants', isAuthenticated, isSuperAdmin, getAllRestaurants);
router.get('/users', isAuthenticated, isSuperAdmin, getAllUsers);
router.get('/orders/all', isAuthenticated, isSuperAdmin, getAllOrders);


// --- Restaurant Admin Routes ---

// --- THIS IS THE FIX ---
// Add the route to GET all orders for the logged-in restaurant admin
router.get('/orders', isAuthenticated, isRestaurantAdmin, getRestaurantOrders);
// --- END OF FIX ---

// Route to update a specific order's status
router.put('/orders/:id/status', isAuthenticated, isRestaurantAdmin, updateOrderStatus);

// Route to update restaurant open/closed status
router.put('/restaurant/status', isAuthenticated, isRestaurantAdmin, updateRestaurantOpenStatus);

module.exports = router;