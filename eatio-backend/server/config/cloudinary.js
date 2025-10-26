// server/config/cloudinary.js

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary with credentials from .env file
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer-storage-cloudinary for general uploads
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'eatio-backend',
    allowed_formats: ['jpg', 'png', 'jpeg', 'pdf'],
  },
});

// Configure multer-storage-cloudinary for menu images with specific folder structure
const menuImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'eatio-backend/menu-images',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'gif'],
    transformation: [
      { width: 800, height: 600, crop: 'fill', quality: 'auto' },
      { fetch_format: 'auto' }
    ],
  },
});

// Configure multer-storage-cloudinary for restaurant images
const restaurantImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'eatio-backend/restaurant-images',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'gif'],
    transformation: [
      { width: 1200, height: 800, crop: 'fill', quality: 'auto' },
      { fetch_format: 'auto' }
    ],
  },
});

// Configure multer-storage-cloudinary for user profile images
const profileImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'eatio-backend/profile-images',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [
      { width: 400, height: 400, crop: 'fill', quality: 'auto', gravity: 'face' },
      { fetch_format: 'auto' }
    ],
  },
});

const upload = multer({ storage: storage });
const uploadMenuImage = multer({ storage: menuImageStorage });
const uploadRestaurantImage = multer({ storage: restaurantImageStorage });
const uploadProfileImage = multer({ storage: profileImageStorage });

// Helper function to delete image from Cloudinary
const deleteFromCloudinary = async (publicId) => {
  try {
    const isDebug = process.env.NODE_ENV === 'development';
    if (isDebug) console.log(`🗑️ [CLOUDINARY] Attempting to delete image with public ID: ${publicId}`);
    
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      console.log(`✅ [CLOUDINARY] Successfully deleted image: ${publicId}`);
    } else if (result.result === 'not found') {
      console.log(`⚠️ [CLOUDINARY] Image not found (may have been already deleted): ${publicId}`);
    } else {
      console.log(`⚠️ [CLOUDINARY] Unexpected deletion result for ${publicId}: ${result.result}`);
    }
    
    return result;
  } catch (error) {
    console.error(`❌ [CLOUDINARY] Error deleting from Cloudinary:`, error);
    throw error;
  }
};

// Helper function to extract public ID from Cloudinary URL
const getPublicIdFromUrl = (url) => {
  try {
    const isDebug = process.env.NODE_ENV === 'development';
    if (isDebug) console.log(`🔍 [CLOUDINARY] Extracting public ID from URL: ${url}`);
    
    if (!url || !url.includes('cloudinary.com')) {
      if (isDebug) console.log(`❌ [CLOUDINARY] Invalid URL or not a Cloudinary URL`);
      return null;
    }
    
    const parts = url.split('/');
    if (isDebug) console.log(`🔍 [CLOUDINARY] URL parts:`, parts);
    
    const uploadIndex = parts.findIndex(part => part === 'upload');
    if (uploadIndex === -1) {
      if (isDebug) console.log(`❌ [CLOUDINARY] 'upload' not found in URL parts`);
      return null;
    }
    
    // Get everything after 'upload', handling both versioned and non-versioned URLs
    let afterUpload = parts.slice(uploadIndex + 1);
    
    // If the first part after upload starts with 'v' followed by numbers, it's a version - skip it
    if (afterUpload.length > 0 && /^v\d+$/.test(afterUpload[0])) {
      afterUpload = afterUpload.slice(1);
    }
    
    const publicIdWithExtension = afterUpload.join('/');
    
    // Remove file extension
    const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, '');
    
    if (isDebug) console.log(`🔍 [CLOUDINARY] Extracted public ID: ${publicId}`);
    
    return publicId;
  } catch (error) {
    console.error(`❌ [CLOUDINARY] Error extracting public ID:`, error);
    return null;
  }
};

module.exports = {
  upload,
  uploadMenuImage,
  uploadRestaurantImage,
  uploadProfileImage,
  cloudinary,
  deleteFromCloudinary,
  getPublicIdFromUrl
};
