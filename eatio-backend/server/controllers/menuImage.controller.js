// server/controllers/menuImage.controller.js

const { deleteFromCloudinary, getPublicIdFromUrl } = require('../config/cloudinary');

// Upload menu item image to Cloudinary
const uploadMenuImageController = async (req, res) => {
  try {
    console.log(`📤 [CLOUDINARY_UPLOAD] Starting image upload process`);
    console.log(`📤 [CLOUDINARY_UPLOAD] Request file:`, req.file ? 'Present' : 'Missing');
    
    if (!req.file) {
      console.log(`❌ [CLOUDINARY_UPLOAD] No file in request`);
      return res.status(400).json({ message: 'No image file uploaded.' });
    }

    console.log(`📤 [CLOUDINARY_UPLOAD] File details:`, {
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      path: req.file.path,
      publicId: req.file.public_id
    });

    const response = {
      message: 'Menu item image uploaded successfully to Cloudinary.',
      imageUrl: req.file.path, // Cloudinary secure URL
      publicId: req.file.public_id,
      originalName: req.file.originalname,
      size: req.file.size
    };

    console.log(`✅ [CLOUDINARY_UPLOAD] Upload successful, response:`, response);
    res.status(200).json(response);

  } catch (error) {
    console.error('❌ [CLOUDINARY_UPLOAD] Upload menu image error:', error);
    res.status(500).json({ message: 'Server error uploading image to Cloudinary.' });
  }
};

// Delete menu item image from Cloudinary
const deleteMenuImageController = async (req, res) => {
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

    console.log(`🗑️ [CLOUDINARY_DELETE] Attempting to delete image with public ID: ${publicId}`);

    // Delete from Cloudinary
    const result = await deleteFromCloudinary(publicId);
    
    console.log(`🗑️ [CLOUDINARY_DELETE] Cloudinary deletion result:`, result);

    if (result.result === 'ok') {
      res.status(200).json({ 
        message: 'Image deleted successfully from Cloudinary.',
        result: result
      });
    } else {
      res.status(404).json({ 
        message: 'Image not found in Cloudinary.',
        result: result
      });
    }

  } catch (error) {
    console.error('❌ [CLOUDINARY_DELETE] Delete menu image error:', error);
    res.status(500).json({ message: 'Server error deleting image from Cloudinary.' });
  }
};

module.exports = {
  uploadMenuImageController,
  deleteMenuImageController
};