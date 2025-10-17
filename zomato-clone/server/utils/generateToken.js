// server/utils/generateToken.js

const jwt = require('jsonwebtoken');

// The function now accepts a 'role' to create a unique cookie name.
const generateToken = (res, userId, role) => {
  const token = jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  // Create a dynamic cookie name, e.g., 'jwt_customer' or 'jwt_admin'
  const cookieName = `jwt_${role}`;

  res.cookie(cookieName, token, {
    httpOnly: true, // Prevents client-side JS from accessing (XSS protection)
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    sameSite: 'strict', // Mitigates CSRF attacks
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

module.exports = generateToken;