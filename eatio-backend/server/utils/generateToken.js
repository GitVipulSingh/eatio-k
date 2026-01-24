// server/utils/generateToken.js

const jwt = require('jsonwebtoken');

// The function now accepts a 'role' to create a unique cookie name.
const generateToken = (res, userId, role) => {
  const token = jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  // Create a dynamic cookie name, e.g., 'jwt_customer' or 'jwt_admin'
  const cookieName = `jwt_${role}`;

  // Production-ready cookie configuration
  const cookieOptions = {
    httpOnly: true, // Prevents client-side JS from accessing (XSS protection)
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production (HTTPS)
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Changed from 'strict' to 'lax' for better compatibility
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  };

  // Don't set domain in production - let browser handle it automatically
  // This is more reliable for cross-subdomain scenarios
  
  console.log(`🍪 Setting ${cookieName} cookie with options:`, {
    secure: cookieOptions.secure,
    sameSite: cookieOptions.sameSite,
    httpOnly: cookieOptions.httpOnly,
    environment: process.env.NODE_ENV
  });

  res.cookie(cookieName, token, cookieOptions);
};

module.exports = generateToken;