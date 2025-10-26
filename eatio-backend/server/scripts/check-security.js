// server/scripts/check-security.js

const fs = require('fs');
const path = require('path');
require('dotenv').config();

/**
 * Security checker script to identify potential security issues
 */

const checkEnvironmentSecurity = () => {
  console.log('🔒 Security Check: Environment Variables');
  console.log('=====================================\n');

  const warnings = [];
  const errors = [];

  // Check for default/weak passwords
  if (process.env.SUPERADMIN_PASSWORD === 'superadmin123' || 
      process.env.SUPERADMIN_PASSWORD === 'admin123' ||
      process.env.SUPERADMIN_PASSWORD === 'password123') {
    errors.push('SUPERADMIN_PASSWORD uses a default/weak password');
  }

  // Check for test credentials in production
  if (process.env.NODE_ENV === 'production') {
    if (process.env.RAZORPAY_KEY_ID?.includes('test')) {
      errors.push('Using test Razorpay keys in production environment');
    }
    
    if (process.env.SUPERADMIN_EMAIL?.includes('example.com') || 
        process.env.SUPERADMIN_EMAIL?.includes('test.com')) {
      warnings.push('Using example email for superadmin in production');
    }
  }

  // Check JWT secret strength
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    warnings.push('JWT_SECRET should be at least 32 characters long');
  }

  // Check for localhost URLs in production
  if (process.env.NODE_ENV === 'production') {
    if (process.env.CLIENT_URL?.includes('localhost') || 
        process.env.ADMIN_URL?.includes('localhost')) {
      errors.push('Using localhost URLs in production environment');
    }
  }

  // Display results
  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ No security issues found!');
  } else {
    if (errors.length > 0) {
      console.log('❌ SECURITY ERRORS (must fix):');
      errors.forEach(error => console.log(`   - ${error}`));
      console.log('');
    }

    if (warnings.length > 0) {
      console.log('⚠️  SECURITY WARNINGS (should fix):');
      warnings.forEach(warning => console.log(`   - ${warning}`));
      console.log('');
    }
  }

  return { errors, warnings };
};

const checkFilePermissions = () => {
  console.log('🔒 Security Check: File Permissions');
  console.log('===================================\n');

  const envFile = path.join(__dirname, '..', '.env');
  
  try {
    const stats = fs.statSync(envFile);
    const mode = stats.mode & parseInt('777', 8);
    
    if (mode > parseInt('600', 8)) {
      console.log('⚠️  .env file permissions are too open');
      console.log('   Recommended: chmod 600 .env');
    } else {
      console.log('✅ .env file permissions are secure');
    }
  } catch (error) {
    console.log('❌ Could not check .env file permissions');
  }
};

const generateSecureCredentials = () => {
  console.log('🔐 Secure Credential Generator');
  console.log('=============================\n');

  // Generate secure JWT secret
  const jwtSecret = require('crypto').randomBytes(64).toString('hex');
  
  // Generate secure password
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  console.log('Generated secure credentials:');
  console.log('');
  console.log('JWT_SECRET=' + jwtSecret);
  console.log('SUPERADMIN_PASSWORD=' + password);
  console.log('');
  console.log('⚠️  Copy these to your .env file and keep them secure!');
};

const main = () => {
  console.log('🛡️  Eatio Security Checker');
  console.log('========================\n');

  const { errors, warnings } = checkEnvironmentSecurity();
  console.log('');
  
  checkFilePermissions();
  console.log('');

  if (process.argv.includes('--generate')) {
    generateSecureCredentials();
    console.log('');
  }

  // Exit with error code if there are security errors
  if (errors.length > 0) {
    console.log('❌ Security check failed. Please fix the errors above.');
    process.exit(1);
  } else if (warnings.length > 0) {
    console.log('⚠️  Security check passed with warnings. Consider fixing the warnings above.');
  } else {
    console.log('✅ Security check passed!');
  }
};

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { checkEnvironmentSecurity, checkFilePermissions, generateSecureCredentials };