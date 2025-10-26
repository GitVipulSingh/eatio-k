// server/scripts/test-cloudinary.js

const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Test Cloudinary connection
const testCloudinary = async () => {
  try {
    console.log('🧪 Testing Cloudinary connection...');
    
    // Test 1: Check configuration
    console.log('📋 Cloudinary Configuration:');
    console.log(`   Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
    console.log(`   API Key: ${process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not Set'}`);
    console.log(`   API Secret: ${process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not Set'}`);
    
    // Test 2: List resources in the folder
    console.log(`\n📋 Listing resources in eatio-backend folder...`);
    const resources = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'eatio-backend/',
      max_results: 10
    });
    
    console.log(`   Found ${resources.resources.length} resources:`);
    resources.resources.forEach((resource, index) => {
      console.log(`   ${index + 1}. ${resource.public_id} (${resource.bytes} bytes)`);
    });
    
    // Test 3: Check API connectivity
    console.log(`\n🔗 Testing API connectivity...`);
    const usage = await cloudinary.api.usage();
    console.log(`   Storage used: ${(usage.storage.used_bytes / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Transformations this month: ${usage.transformations.usage}`);
    
    console.log('\n✅ All Cloudinary tests completed successfully!');
    console.log('💡 Upload functionality is tested through the API endpoints');
    
  } catch (error) {
    console.error('❌ Cloudinary test failed:', error);
  }
};

// Run test if called directly
if (require.main === module) {
  testCloudinary();
}

module.exports = { testCloudinary };