// server/routes/registrationImage.routes.js

const express = require('express');
const router = express.Router();
const { uploadRestaurantImage, uploadRegistrationDocument } = require('../config/cloudinary');
const { uploadRestaurantImageController } = require('../controllers/restaurantImage.controller');

// @route   POST /api/registration-images/restaurant
// @desc    Upload restaurant image during registration (public access)
// @access  Public (for registration process)
router.post('/restaurant', 
  uploadRestaurantImage.single('image'), 
  uploadRestaurantImageController
);

// @route   POST /api/registration-images/document
// @desc    Upload documents (FSSAI, etc.) during registration (public access)
// @access  Public (for registration process)
router.post('/document', 
  uploadRegistrationDocument.single('document'), 
  (req, res) => {
    try {
      console.log(`📄 [DOCUMENT_UPLOAD] Starting document upload process`);
      console.log(`📄 [DOCUMENT_UPLOAD] Request file:`, req.file ? 'Present' : 'Missing');
      
      if (!req.file) {
        console.log(`❌ [DOCUMENT_UPLOAD] No file in request`);
        return res.status(400).json({ message: 'No document file uploaded.' });
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        console.log(`❌ [DOCUMENT_UPLOAD] Invalid file type: ${req.file.mimetype}`);
        return res.status(400).json({ 
          message: 'Invalid file type. Only JPG, PNG, and PDF files are allowed for documents.' 
        });
      }

      console.log(`📄 [DOCUMENT_UPLOAD] File details:`, {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        publicId: req.file.public_id
      });

      const response = {
        message: 'Document uploaded successfully to Cloudinary.',
        documentUrl: req.file.path, // Cloudinary secure URL
        publicId: req.file.public_id,
        originalName: req.file.originalname,
        size: req.file.size,
        fileType: req.file.mimetype
      };

      console.log(`✅ [DOCUMENT_UPLOAD] Upload successful, response:`, response);
      res.status(200).json(response);

    } catch (error) {
      console.error('❌ [DOCUMENT_UPLOAD] Upload document error:', error);
      
      // Handle multer errors
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File too large. Maximum size is 10MB.' });
      }
      
      res.status(500).json({ message: 'Server error uploading document to Cloudinary.' });
    }
  }
);

module.exports = router;