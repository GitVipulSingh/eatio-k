// Debug script for review submission issue
const mongoose = require('mongoose');
require('dotenv').config();

const Order = require('./models/order.model');
const Review = require('./models/review.model');
const Restaurant = require('./models/restaurant.model');

const debugReviewIssue = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const orderId = '68fbe3edb675f02995ea8e06';
    console.log(`\n🔍 Debugging order ID: ${orderId}`);

    // Check if the order ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      console.log('❌ Invalid ObjectId format');
      process.exit(1);
    }
    console.log('✅ Valid ObjectId format');

    // Check if order exists
    const order = await Order.findById(orderId);
    if (!order) {
      console.log('❌ Order not found');
      
      // Let's find some actual orders to test with
      console.log('\n📋 Finding actual orders in database:');
      const orders = await Order.find({}).limit(5);
      orders.forEach(order => {
        console.log(`- Order ID: ${order._id}, Status: ${order.status}, User: ${order.user}, Restaurant: ${order.restaurant}`);
      });
      
      process.exit(1);
    }

    console.log('✅ Order found:', {
      id: order._id,
      status: order.status,
      user: order.user,
      restaurant: order.restaurant,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt
    });

    // Check if order is delivered
    if (order.status !== 'Delivered') {
      console.log(`⚠️  Order status is '${order.status}', not 'Delivered'`);
    } else {
      console.log('✅ Order is delivered');
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ order: orderId });
    if (existingReview) {
      console.log('⚠️  Review already exists:', {
        id: existingReview._id,
        rating: existingReview.rating,
        comment: existingReview.comment,
        createdAt: existingReview.createdAt
      });
    } else {
      console.log('✅ No existing review found');
    }

    // Check if restaurant exists
    const restaurant = await Restaurant.findById(order.restaurant);
    if (!restaurant) {
      console.log('❌ Restaurant not found');
    } else {
      console.log('✅ Restaurant found:', {
        id: restaurant._id,
        name: restaurant.name,
        averageRating: restaurant.averageRating,
        totalRatingSum: restaurant.totalRatingSum,
        totalRatingCount: restaurant.totalRatingCount
      });
    }

    console.log('\n✅ Debug completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during debug:', error);
    process.exit(1);
  }
};

debugReviewIssue();