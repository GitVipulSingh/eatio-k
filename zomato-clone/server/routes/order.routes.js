// server/routes/order.routes.js

const express = require('express');
const router = express.Router();
const { createOrder, getOrderHistory, getOrderById } = require('../controllers/order.controller');
const { isAuthenticated } = require('../middlewares/auth.middleware');

// All routes in this file are protected and require a logged-in user.
router.use(isAuthenticated);

router.post('/', createOrder);

// --- THIS IS THE FIX ---
// The most specific route, '/history', MUST come before the dynamic route, '/:id'.
router.get('/history', getOrderHistory);
router.get('/:id', getOrderById);
// --- END OF FIX ---

module.exports = router;