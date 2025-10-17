// server/routes/restaurant.routes.js

const express = require('express');
const router = express.Router();
const {
  getAllRestaurants,
  getRestaurantById,
  addMenuItem,
  getMyRestaurant,
  updateMenuItem,
  deleteMenuItem,
} = require('../controllers/restaurant.controller');
// --- UPDATED IMPORT ---
const { isAuthenticated, isRestaurantAdmin } = require('../middlewares/auth.middleware');

// --- Public Routes ---
router.get('/', getAllRestaurants);

// --- Admin Protected Routes ---
// These routes now use the new, more secure middleware
router.get('/my-restaurant', isAuthenticated, isRestaurantAdmin, getMyRestaurant);
router.post('/menu', isAuthenticated, isRestaurantAdmin, addMenuItem);
router.put('/menu/:menuItemId', isAuthenticated, isRestaurantAdmin, updateMenuItem);
router.delete('/menu/:menuItemId', isAuthenticated, isRestaurantAdmin, deleteMenuItem);

// This generic route must be last
router.get('/:id', getRestaurantById);

module.exports = router;
