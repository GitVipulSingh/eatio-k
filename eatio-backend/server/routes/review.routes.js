// server/routes/review.routes.js
// NEW FILE - ADDITIVE IMPLEMENTATION FOR RATING SYSTEM

const express = require('express');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const Review = require('../models/review.model');
const Restaurant = require('../models/restaurant.model');
const Order = require('../models/order.model');
const { isAuthenticated } = require('../middlewares/auth.middleware');

const router = express.Router();

// @desc    Create a new review for an order
// @route   POST /api/reviews/order/:orderId
// @access  Private
router.post('/order/:orderId', 
  isAuthenticated,
  [
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    body('comment')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Comment must be less than 500 characters'),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { orderId } = req.params;
    const { rating, comment = '' } = req.body;
    const userId = req.user._id;

    // Check if order exists and belongs to user
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to review this order' });
    }

    // Check if order is delivered
    if (order.status !== 'Delivered') {
      return res.status(400).json({ message: 'Can only review delivered orders' });
    }

    // Check if review already exists for this order
    const existingReview = await Review.findOne({ order: orderId });
    if (existingReview) {
      return res.status(400).json({ message: 'Order already reviewed' });
    }

    // Create new review
    const review = new Review({
      user: userId,
      restaurant: order.restaurant,
      order: orderId,
      rating,
      comment,
    });

    await review.save();

    // Update restaurant's rating statistics
    const restaurant = await Restaurant.findById(order.restaurant);
    if (restaurant) {
      const oldRating = restaurant.averageRating;
      restaurant.totalRatingSum += rating;
      restaurant.totalRatingCount += 1;
      restaurant.averageRating = restaurant.totalRatingSum / restaurant.totalRatingCount;
      await restaurant.save();
      
      console.log(`⭐ [RATING_UPDATE] Restaurant ${restaurant.name} rating updated from ${oldRating} to ${restaurant.averageRating}`);
      
      // Emit real-time update for restaurant rating
      const io = req.app.get('socketio');
      if (io) {
        io.emit('restaurant_rating_updated', {
          restaurantId: restaurant._id,
          restaurantName: restaurant.name,
          oldRating,
          newRating: restaurant.averageRating,
          totalReviews: restaurant.totalRatingCount,
          timestamp: new Date()
        });
        console.log(`📡 [RATING_UPDATE] Socket event emitted for rating update`);
      }
    }

    res.status(201).json({
      message: 'Review created successfully',
      review: {
        _id: review._id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
      },
    });
  })
);

// @desc    Get reviews for a restaurant
// @route   GET /api/reviews/restaurant/:restaurantId
// @access  Public
router.get('/restaurant/:restaurantId', 
  asyncHandler(async (req, res) => {
    const { restaurantId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ restaurant: restaurantId })
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalReviews = await Review.countDocuments({ restaurant: restaurantId });

    res.json({
      reviews,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalReviews / limit),
        totalReviews,
        hasNext: page < Math.ceil(totalReviews / limit),
        hasPrev: page > 1,
      },
    });
  })
);

// @desc    Check if user can review an order
// @route   GET /api/reviews/can-review/:orderId
// @access  Private
router.get('/can-review/:orderId',
  isAuthenticated,
  asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const userId = req.user._id;

    const order = await Order.findById(orderId);
    if (!order || order.user.toString() !== userId.toString()) {
      return res.json({ canReview: false, reason: 'Order not found or not authorized' });
    }

    if (order.status !== 'Delivered') {
      return res.json({ canReview: false, reason: 'Order not delivered yet' });
    }

    const existingReview = await Review.findOne({ order: orderId });
    if (existingReview) {
      return res.json({ canReview: false, reason: 'Already reviewed' });
    }

    res.json({ canReview: true });
  })
);

module.exports = router;