// server/routes/menuImage.routes.js

const express = require('express');
const router = express.Router();
const { uploadLocal } = require('../config/localStorage');
const { uploadMenuImage, deleteMenuImage } = require('../controllers/menuImage.controller');
const { isAuthenticated, isRestaurantAdmin } = require('../middlewares/auth.middleware');

// @route   POST /api/menu-images/upload
// @desc    Upload menu item image (local storage)
// @access  Private (Restaurant Admin only)
router.post('/upload', 
  isAuthenticated, 
  isRestaurantAdmin, 
  uploadLocal.single('image'), 
  uploadMenuImage
);

// @route   DELETE /api/menu-images/:filename
// @desc    Delete menu item image
// @access  Private (Restaurant Admin only)
router.delete('/:filename', 
  isAuthenticated, 
  isRestaurantAdmin, 
  deleteMenuImage
);

module.exports = router;