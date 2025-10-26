// server/scripts/create-superadmin.js

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/user.model');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected for superadmin setup');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Create or update superadmin user
const createSuperAdmin = async () => {
  try {
    console.log('👑 Setting up Super Admin user...');
    
    // Get superadmin credentials from environment variables
    const superAdminData = {
      name: process.env.SUPERADMIN_NAME || 'Super Admin',
      email: process.env.SUPERADMIN_EMAIL,
      phone: process.env.SUPERADMIN_PHONE,
      password: process.env.SUPERADMIN_PASSWORD,
      role: 'superadmin'
    };

    // Validate required environment variables
    if (!superAdminData.email || !superAdminData.phone || !superAdminData.password) {
      console.error('❌ Missing required environment variables:');
      console.error('   SUPERADMIN_EMAIL - Super admin email address');
      console.error('   SUPERADMIN_PHONE - Super admin phone number');
      console.error('   SUPERADMIN_PASSWORD - Super admin password');
      console.error('   SUPERADMIN_NAME (optional) - Super admin name');
      console.error('');
      console.error('💡 Please set these in your .env file before running this script.');
      process.exit(1);
    }
    
    // Check if superadmin already exists
    const existingSuperAdmin = await User.findOne({ 
      $or: [
        { email: superAdminData.email },
        { role: 'superadmin' }
      ]
    });
    
    if (existingSuperAdmin) {
      console.log('👑 Super Admin user already exists:');
      console.log(`   Name: ${existingSuperAdmin.name}`);
      console.log(`   Email: ${existingSuperAdmin.email}`);
      console.log(`   Phone: ${existingSuperAdmin.phone}`);
      console.log(`   Role: ${existingSuperAdmin.role}`);
      
      // Update the existing user to ensure it has superadmin role
      if (existingSuperAdmin.role !== 'superadmin') {
        existingSuperAdmin.role = 'superadmin';
        await existingSuperAdmin.save();
        console.log('✅ Updated existing user to superadmin role');
      }
      
      return existingSuperAdmin;
    }
    
    // Create new superadmin user
    const superAdmin = new User(superAdminData);
    await superAdmin.save();
    
    console.log('✅ Super Admin user created successfully!');
    console.log(`   Name: ${superAdmin.name}`);
    console.log(`   Email: ${superAdmin.email}`);
    console.log(`   Phone: ${superAdmin.phone}`);
    console.log(`   Role: ${superAdmin.role}`);
    console.log('');
    console.log('🔑 Login Credentials:');
    console.log(`   Email: ${superAdminData.email}`);
    console.log(`   Password: [HIDDEN - Check your .env file]`);
    console.log('');
    console.log('⚠️  IMPORTANT: Keep your credentials secure!');
    
    return superAdmin;
    
  } catch (error) {
    console.error('❌ Error creating superadmin:', error);
    throw error;
  }
};

// Check existing users and their roles
const checkExistingUsers = async () => {
  try {
    console.log('\n📋 Checking existing users...');
    
    const users = await User.find().select('name email phone role');
    console.log(`   Total users: ${users.length}`);
    
    const roleCount = {};
    users.forEach(user => {
      roleCount[user.role] = (roleCount[user.role] || 0) + 1;
    });
    
    console.log('   Role distribution:');
    Object.entries(roleCount).forEach(([role, count]) => {
      console.log(`     ${role}: ${count}`);
    });
    
    const superAdmins = users.filter(user => user.role === 'superadmin');
    if (superAdmins.length > 0) {
      console.log('\n👑 Existing Super Admins:');
      superAdmins.forEach(admin => {
        console.log(`   - ${admin.name} (${admin.email})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking users:', error);
  }
};

// Main function
const setupSuperAdmin = async () => {
  try {
    await connectDB();
    await checkExistingUsers();
    await createSuperAdmin();
    
    console.log('\n✅ Super Admin setup completed!');
    console.log('💡 You can now login to the Super Admin dashboard');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run setup if called directly
if (require.main === module) {
  setupSuperAdmin();
}

module.exports = { setupSuperAdmin, createSuperAdmin };