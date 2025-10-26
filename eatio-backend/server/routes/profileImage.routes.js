// server/routes/profileImage.routes.js

const express = require('express');
const router = express.Router();
const { uploadProfileImage } = require('../config/cloudinary');
const { uploadProfileImageController, deleteProfileImageController } = require('../controllers/profileImage.controller');
const { isAuthenticated } = require('../middlewares/auth.middleware');

// @route   POST /api/profile-images/upload
// @desc    Upload profile image to Cloudinary
// @access  Private (Authenticated users only)
router.post('/upload', 
  isAuthenticated, 
  uploadProfileImage.single('image'), 
  uploadProfileImageController
);

// @route   DELETE /api/profile-images/:publicId
// @desc    Delete profile image from Cloudinary (publicId can contain slashes)
// @access  Private (Authenticated users only)
router.delete('/:publicId', 
  isAuthenticated, 
  deleteProfileImageController
);

// Catch-all route for nested publicIds with slashes
router.delete('/:folder/:publicId', 
  isAuthenticated, 
  deleteProfileImageController
);

module.exports = router;