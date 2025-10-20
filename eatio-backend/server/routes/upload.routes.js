// server/routes/upload.routes.js

const express = require('express');
const router = express.Router();
const upload = require('../config/cloudinary');
// const { isAuthenticated } = require('../middlewares/auth.middleware'); // Middleware is removed

// @route   POST /api/upload
// @desc    Upload an image to Cloudinary
// @access  Public (for registration)
// The 'isAuthenticated' security middleware has been removed from this route.
router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  // Send back the secure URL of the uploaded image
  res.status(200).json({
    message: 'Image uploaded successfully.',
    imageUrl: req.file.path,
  });
});

module.exports = router;
