// server/routes/search.routes.js

const express = require('express');
const router = express.Router();
const { searchRestaurants } = require('../controllers/search.controller');

// @route   GET /api/search
// @desc    The main endpoint for all search functionality
router.get('/', searchRestaurants);

module.exports = router;
