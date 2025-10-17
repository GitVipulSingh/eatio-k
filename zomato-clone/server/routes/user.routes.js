// server/routes/user.routes.js

const express = require('express');
const router = express.Router();
const { getUserProfile } = require('../controllers/user.controller');
const { isAuthenticated } = require('../middlewares/auth.middleware');

// This route is protected. The `isAuthenticated` middleware will run first.
// If the user is authenticated, it will proceed to `getUserProfile`.
// If not, the middleware will send a 401 Unauthorized error.
router.get('/profile', isAuthenticated, getUserProfile);

module.exports = router;
