// server/controllers/menuImage.controller.js

const path = require('path');
const { deleteLocalFile, getImageUrl } = require('../config/localStorage');

// Upload menu item image
const uploadMenuImage = async (req, res) => {
  try {
    console.log(`📤 [UPLOAD] Starting image upload process`);
    console.log(`📤 [UPLOAD] Request file:`, req.file ? 'Present' : 'Missing');
    
    if (!req.file) {
      console.log(`❌ [UPLOAD] No file in request`);
      return res.status(400).json({ message: 'No image file uploaded.' });
    }

    console.log(`📤 [UPLOAD] File details:`, {
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      path: req.file.path
    });

    // Generate the URL for the uploaded image
    const imageUrl = getImageUrl(req.file.filename);
    console.log(`📤 [UPLOAD] Generated image URL: ${imageUrl}`);

    const response = {
      message: 'Menu item image uploaded successfully.',
      imageUrl: imageUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    };

    console.log(`✅ [UPLOAD] Upload successful, response:`, response);
    res.status(200).json(response);

  } catch (error) {
    console.error('❌ [UPLOAD] Upload menu image error:', error);
    res.status(500).json({ message: 'Server error uploading image.' });
  }
};

// Delete menu item image
const deleteMenuImage = async (req, res) => {
  try {
    const { filename } = req.params;
    
    if (!filename) {
      return res.status(400).json({ message: 'Filename is required.' });
    }

    // Get the full file path
    const filePath = path.join(__dirname, '../uploads/menu_images', filename);
    
    // Delete the file
    const deleted = deleteLocalFile(filePath);
    
    if (deleted) {
      res.status(200).json({ message: 'Image deleted successfully.' });
    } else {
      res.status(404).json({ message: 'Image file not found.' });
    }

  } catch (error) {
    console.error('Delete menu image error:', error);
    res.status(500).json({ message: 'Server error deleting image.' });
  }
};

module.exports = {
  uploadMenuImage,
  deleteMenuImage
};