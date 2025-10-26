// server/scripts/cleanup-local-files.js

const fs = require('fs');
const path = require('path');

// Check cleanup status after migration
const checkCleanupStatus = async () => {
  try {
    console.log('🧹 Local File Cleanup Status');
    console.log('============================\n');
    
    const uploadsDir = path.join(__dirname, '../uploads');
    
    // Check if uploads directory exists
    const uploadsExists = fs.existsSync(uploadsDir);
    
    console.log('📁 Directory Status:');
    console.log(`   Uploads directory: ${uploadsExists ? 'EXISTS' : 'CLEANED UP ✅'}`);
    
    if (!uploadsExists) {
      console.log('\n✅ All local files have been cleaned up successfully!');
      console.log('💡 Your application now uses Cloudinary for all image storage.');
      console.log('🔗 Images are served via Cloudinary CDN for optimal performance.');
      return;
    }
    
    // If directory exists, check what's in it
    const contents = fs.readdirSync(uploadsDir);
    console.log(`\n📊 Remaining contents: ${contents.length} items`);
    
    if (contents.length === 0) {
      console.log('   Directory is empty - safe to remove');
      try {
        fs.rmdirSync(uploadsDir);
        console.log('   ✅ Empty uploads directory removed');
      } catch (error) {
        console.log('   ⚠️  Could not remove empty directory');
      }
    } else {
      contents.forEach(item => {
        const itemPath = path.join(uploadsDir, item);
        const isDir = fs.statSync(itemPath).isDirectory();
        console.log(`   - ${item} ${isDir ? '(directory)' : '(file)'}`);
      });
    }
    
    console.log('\n✅ Cleanup status check completed!');
    
  } catch (error) {
    console.error('❌ Cleanup status check failed:', error);
  }
};

// Run status check if called directly
if (require.main === module) {
  checkCleanupStatus();
}

module.exports = { checkCleanupStatus };