// server/routes/restaurantImage.routes.js

const express = require('express');
const router = express.Router();
const { uploadRestaurantImage } = require('../config/cloudinary');
const { uploadRestaurantImageController, deleteRestaurantImageController } = require('../controllers/restaurantImage.controller');
const { isAuthenticated, isRestaurantAdmin } = require('../middlewares/auth.middleware');

// @route   POST /api/restaurant-images/upload
// @desc    Upload restaurant image to Cloudinary
// @access  Private (Restaurant Admin only)
router.post('/upload', 
  isAuthenticated, 
  isRestaurantAdmin, 
  uploadRestaurantImage.single('image'), 
  uploadRestaurantImageController
);

// @route   DELETE /api/restaurant-images/:publicId
// @desc    Delete restaurant image from Cloudinary (publicId can contain slashes)
// @access  Private (Restaurant Admin only)
router.delete('/:publicId', 
  isAuthenticated, 
  isRestaurantAdmin, 
  deleteRestaurantImageController
);

// Catch-all route for nested publicIds with slashes
router.delete('/:folder/:publicId', 
  isAuthenticated, 
  isRestaurantAdmin, 
  deleteRestaurantImageController
);

module.exports = router;