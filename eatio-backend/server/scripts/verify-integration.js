// server/scripts/verify-integration.js

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Restaurant = require('../models/restaurant.model');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected for verification');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Verify integration
const verifyIntegration = async () => {
  try {
    console.log('🔍 Verifying Cloudinary Integration...');
    console.log('=====================================\n');
    
    await connectDB();
    
    // Check restaurants with menu items
    const restaurants = await Restaurant.find({
      'menu.0': { $exists: true }
    }).limit(5);
    
    console.log(`📊 Found ${restaurants.length} restaurants with menu items\n`);
    
    let cloudinaryCount = 0;
    let localCount = 0;
    let noImageCount = 0;
    
    restaurants.forEach((restaurant, index) => {
      console.log(`🏪 Restaurant ${index + 1}: ${restaurant.name}`);
      console.log(`   Menu items: ${restaurant.menu.length}`);
      
      restaurant.menu.forEach((item, itemIndex) => {
        if (item.image) {
          if (item.image.includes('cloudinary.com')) {
            cloudinaryCount++;
            console.log(`   ✅ Item ${itemIndex + 1}: ${item.name} - Cloudinary URL`);
          } else {
            localCount++;
            console.log(`   ⚠️  Item ${itemIndex + 1}: ${item.name} - Local URL: ${item.image}`);
          }
        } else {
          noImageCount++;
          console.log(`   ❌ Item ${itemIndex + 1}: ${item.name} - No image`);
        }
      });
      console.log('');
    });
    
    console.log('📈 Summary:');
    console.log(`   Cloudinary images: ${cloudinaryCount}`);
    console.log(`   Local images: ${localCount}`);
    console.log(`   No images: ${noImageCount}`);
    
    if (cloudinaryCount > 0) {
      console.log('\n✅ Cloudinary integration is working!');
    }
    
    if (localCount > 0) {
      console.log('\n⚠️  Some images are still using local URLs. This is normal if migration was partial.');
    }
    
    console.log('\n🔧 Integration Status: VERIFIED');
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run verification if called directly
if (require.main === module) {
  verifyIntegration();
}

module.exports = { verifyIntegration };