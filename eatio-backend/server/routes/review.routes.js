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
    console.log(`📝 [REVIEW_CREATE] Starting review creation for order ${req.params.orderId}`);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(`❌ [REVIEW_CREATE] Validation failed:`, errors.array());
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { orderId } = req.params;
    const { rating, comment = '' } = req.body;
    const userId = req.user._id;

    console.log(`📝 [REVIEW_CREATE] Request details:`, { orderId, rating, comment, userId });

    // Check if order exists and belongs to user
    const order = await Order.findById(orderId);
    if (!order) {
      console.log(`❌ [REVIEW_CREATE] Order not found: ${orderId}`);
      return res.status(404).json({ message: 'Order not found' });
    }

    console.log(`📝 [REVIEW_CREATE] Order found:`, { 
      id: order._id, 
      status: order.status, 
      user: order.user, 
      restaurant: order.restaurant 
    });

    if (order.user.toString() !== userId.toString()) {
      console.log(`❌ [REVIEW_CREATE] Unauthorized: Order user ${order.user} !== Request user ${userId}`);
      return res.status(403).json({ message: 'Not authorized to review this order' });
    }

    // Check if order is delivered
    if (order.status !== 'Delivered') {
      console.log(`❌ [REVIEW_CREATE] Order not delivered: Status is ${order.status}`);
      return res.status(400).json({ message: 'Can only review delivered orders' });
    }

    // Check if review already exists for this order
    const existingReview = await Review.findOne({ order: orderId });
    if (existingReview) {
      console.log(`❌ [REVIEW_CREATE] Review already exists:`, { 
        reviewId: existingReview._id, 
        rating: existingReview.rating 
      });
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

    try {
      await review.save();
      console.log(`✅ [REVIEW_CREATE] Review created successfully for order ${orderId}`);
    } catch (saveError) {
      console.error(`❌ [REVIEW_CREATE] Error saving review:`, saveError);
      
      // Handle duplicate key error (E11000)
      if (saveError.code === 11000) {
        return res.status(400).json({ message: 'Order already reviewed' });
      }
      
      // Re-throw other errors
      throw saveError;
    }

    // Update restaurant's rating statistics
    try {
      const restaurant = await Restaurant.findById(order.restaurant);
      if (restaurant) {
        const oldRating = restaurant.averageRating;
        
        // Get all reviews for this restaurant to calculate accurate rating
        const allReviews = await Review.find({ restaurant: order.restaurant });
        const actualSum = allReviews.reduce((sum, review) => sum + review.rating, 0);
        const actualCount = allReviews.length;
        const newAverageRating = actualCount > 0 ? actualSum / actualCount : 0;
        
        // Update restaurant with accurate values
        await Restaurant.updateOne(
          { _id: order.restaurant },
          {
            $set: {
              totalRatingSum: actualSum,
              totalRatingCount: actualCount,
              averageRating: newAverageRating
            }
          }
        );
        
        console.log(`⭐ [RATING_UPDATE] Restaurant ${restaurant.name} rating updated from ${oldRating} to ${newAverageRating} (${actualCount} reviews, sum: ${actualSum})`);
        
        // Emit real-time update for restaurant rating
        const io = req.app.get('socketio');
        if (io) {
          io.emit('restaurant_rating_updated', {
            restaurantId: restaurant._id,
            restaurantName: restaurant.name,
            oldRating,
            newRating: newAverageRating,
            totalReviews: actualCount,
            timestamp: new Date()
          });
          console.log(`📡 [RATING_UPDATE] Socket event emitted for rating update`);
        }
      } else {
        console.log(`⚠️  [RATING_UPDATE] Restaurant not found: ${order.restaurant}`);
      }
    } catch (restaurantUpdateError) {
      console.error(`❌ [RATING_UPDATE] Error updating restaurant rating:`, restaurantUpdateError);
      // Don't fail the review creation if restaurant update fails
    }

    console.log(`✅ [REVIEW_CREATE] Review creation completed successfully for order ${orderId}`);
    
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