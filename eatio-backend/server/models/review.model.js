// server/models/review.model.js
// NEW FILE - ADDITIVE IMPLEMENTATION FOR RATING SYSTEM

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    default: '',
  },
  isVerifiedPurchase: {
    type: Boolean,
    default: true, // Since this comes from completed orders
  },
}, {
  timestamps: true,
});

// Ensure one review per order
reviewSchema.index({ order: 1 }, { unique: true });

// Index for efficient queries
reviewSchema.index({ restaurant: 1, createdAt: -1 });
reviewSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.models.Review || mongoose.model('Review', reviewSchema);