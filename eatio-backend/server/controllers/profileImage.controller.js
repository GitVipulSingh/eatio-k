// server/controllers/profileImage.controller.js

const { deleteFromCloudinary, getPublicIdFromUrl } = require('../config/cloudinary');

// Upload profile image to Cloudinary
const uploadProfileImageController = async (req, res) => {
  try {
    console.log(`📤 [PROFILE_UPLOAD] Starting profile image upload process`);
    console.log(`📤 [PROFILE_UPLOAD] Request file:`, req.file ? 'Present' : 'Missing');
    
    if (!req.file) {
      console.log(`❌ [PROFILE_UPLOAD] No file in request`);
      return res.status(400).json({ message: 'No image file uploaded.' });
    }

    console.log(`📤 [PROFILE_UPLOAD] File details:`, {
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      path: req.file.path,
      publicId: req.file.public_id
    });

    const response = {
      message: 'Profile image uploaded successfully to Cloudinary.',
      imageUrl: req.file.path, // Cloudinary secure URL
      publicId: req.file.public_id,
      originalName: req.file.originalname,
      size: req.file.size
    };

    console.log(`✅ [PROFILE_UPLOAD] Upload successful, response:`, response);
    res.status(200).json(response);

  } catch (error) {
    console.error('❌ [PROFILE_UPLOAD] Upload profile image error:', error);
    res.status(500).json({ message: 'Server error uploading profile image to Cloudinary.' });
  }
};

// Delete profile image from Cloudinary
const deleteProfileImageController = async (req, res) => {
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

    console.log(`🗑️ [PROFILE_DELETE] Attempting to delete profile image with public ID: ${publicId}`);

    // Delete from Cloudinary
    const result = await deleteFromCloudinary(publicId);
    
    console.log(`🗑️ [PROFILE_DELETE] Cloudinary deletion result:`, result);

    if (result.result === 'ok') {
      res.status(200).json({ 
        message: 'Profile image deleted successfully from Cloudinary.',
        result: result
      });
    } else {
      res.status(404).json({ 
        message: 'Profile image not found in Cloudinary.',
        result: result
      });
    }

  } catch (error) {
    console.error('❌ [PROFILE_DELETE] Delete profile image error:', error);
    res.status(500).json({ message: 'Server error deleting profile image from Cloudinary.' });
  }
};

module.exports = {
  uploadProfileImageController,
  deleteProfileImageController
};