// server/controllers/restaurantImage.controller.js

const { deleteFromCloudinary, getPublicIdFromUrl } = require('../config/cloudinary');

// Upload restaurant image to Cloudinary
const uploadRestaurantImageController = async (req, res) => {
  try {
    console.log(`📤 [RESTAURANT_UPLOAD] Starting restaurant image upload process`);
    console.log(`📤 [RESTAURANT_UPLOAD] Request file:`, req.file ? 'Present' : 'Missing');
    
    if (!req.file) {
      console.log(`❌ [RESTAURANT_UPLOAD] No file in request`);
      return res.status(400).json({ message: 'No image file uploaded.' });
    }

    console.log(`📤 [RESTAURANT_UPLOAD] File details:`, {
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      path: req.file.path,
      publicId: req.file.public_id
    });

    const response = {
      message: 'Restaurant image uploaded successfully to Cloudinary.',
      imageUrl: req.file.path, // Cloudinary secure URL
      publicId: req.file.public_id,
      originalName: req.file.originalname,
      size: req.file.size
    };

    console.log(`✅ [RESTAURANT_UPLOAD] Upload successful, response:`, response);
    res.status(200).json(response);

  } catch (error) {
    console.error('❌ [RESTAURANT_UPLOAD] Upload restaurant image error:', error);
    res.status(500).json({ message: 'Server error uploading restaurant image to Cloudinary.' });
  }
};

// Delete restaurant image from Cloudinary
const deleteRestaurantImageController = async (req, res) => {
  try {
    // Handle both single publicId and folder/publicId patterns
    let publicId;
    if (req.params.folder && req.params.publicId) {
      publicId = `${req.params.folder}/${req.params.publicId}`;
    } else {
      publicId = req.params.publicId;
    }
    
    if (!publicId) {
      return res.status(400).json({ message: 'Public ID is required.' });
    }

    console.log(`🗑️ [RESTAURANT_DELETE] Attempting to delete restaurant image with public ID: ${publicId}`);

    // Delete from Cloudinary
    const result = await deleteFromCloudinary(publicId);
    
    console.log(`🗑️ [RESTAURANT_DELETE] Cloudinary deletion result:`, result);

    if (result.result === 'ok') {
      res.status(200).json({ 
        message: 'Restaurant image deleted successfully from Cloudinary.',
        result: result
      });
    } else {
      res.status(404).json({ 
        message: 'Restaurant image not found in Cloudinary.',
        result: result
      });
    }

  } catch (error) {
    console.error('❌ [RESTAURANT_DELETE] Delete restaurant image error:', error);
    res.status(500).json({ message: 'Server error deleting restaurant image from Cloudinary.' });
  }
};

module.exports = {
  uploadRestaurantImageController,
  deleteRestaurantImageController
};