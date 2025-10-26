// server/routes/menuImage.routes.js

const express = require('express');
const router = express.Router();
const { uploadMenuImage } = require('../config/cloudinary');
const { uploadMenuImageController, deleteMenuImageController } = require('../controllers/menuImage.controller');
const { isAuthenticated, isRestaurantAdmin } = require('../middlewares/auth.middleware');

// @route   POST /api/menu-images/upload
// @desc    Upload menu item image to Cloudinary
// @access  Private (Restaurant Admin only)
router.post('/upload', 
  isAuthenticated, 
  isRestaurantAdmin, 
  uploadMenuImage.single('image'), 
  uploadMenuImageController
);

// @route   DELETE /api/menu-images/:publicId
// @desc    Delete menu item image from Cloudinary (publicId can contain slashes)
// @access  Private (Restaurant Admin only)
router.delete('/:publicId', 
  isAuthenticated, 
  isRestaurantAdmin, 
  deleteMenuImageController
);

// Catch-all route for nested publicIds with slashes
router.delete('/:folder/:publicId', 
  isAuthenticated, 
  isRestaurantAdmin, 
  deleteMenuImageController
);

module.exports = router;