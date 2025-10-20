// server/routes/payment.routes.js

const express = require('express');
const router = express.Router();
const { createRazorpayOrder, verifyPayment } = require('../controllers/payment.controller');
const { isAuthenticated } = require('../middlewares/auth.middleware');

// All payment routes should be protected
router.use(isAuthenticated);

router.post('/create-order', createRazorpayOrder);
router.post('/verify-payment', verifyPayment);

module.exports = router;
