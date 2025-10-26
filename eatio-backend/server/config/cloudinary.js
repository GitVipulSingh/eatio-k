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
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

// Helper function to extract public ID from Cloudinary URL
const getPublicIdFromUrl = (url) => {
  if (!url || !url.includes('cloudinary.com')) return null;
  
  const parts = url.split('/');
  const uploadIndex = parts.findIndex(part => part === 'upload');
  if (uploadIndex === -1) return null;
  
  // Get everything after version (v1234567890)
  const afterVersion = parts.slice(uploadIndex + 2);
  const publicIdWithExtension = afterVersion.join('/');
  
  // Remove file extension
  const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, '');
  return publicId;
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
