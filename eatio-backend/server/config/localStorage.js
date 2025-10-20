// server/config/localStorage.js

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
const menuImagesDir = path.join(uploadsDir, 'menu_images');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(menuImagesDir)) {
  fs.mkdirSync(menuImagesDir, { recursive: true });
}

// Configure multer for local storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, menuImagesDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-restaurantId-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const restaurantId = req.user?.restaurant || 'unknown';
    const extension = path.extname(file.originalname);
    const filename = `${restaurantId}-${uniqueSuffix}${extension}`;
    cb(null, filename);
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

// Configure multer with size limit (5MB)
const uploadLocal = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter
});

// Helper function to delete local file
const deleteLocalFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting local file:', error);
    return false;
  }
};

// Helper function to get full file path from filename
const getLocalFilePath = (filename) => {
  return path.join(menuImagesDir, filename);
};

// Helper function to get URL path for serving images
const getImageUrl = (filename) => {
  const imageUrl = `/api/uploads/menu_images/${filename}`;
  console.log(`🔗 [URL_GEN] Generated URL for filename '${filename}': ${imageUrl}`);
  return imageUrl;
};

module.exports = {
  uploadLocal,
  deleteLocalFile,
  getLocalFilePath,
  getImageUrl,
  menuImagesDir
};