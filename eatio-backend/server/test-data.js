// Test script to verify data aggregation
const mongoose = require('mongoose');
require('dotenv').config();

const Restaurant = require('./models/restaurant.model');
const Order = require('./models/order.model');
const User = require('./models/user.model');

const testDataAggregation = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Test restaurant status counts
    console.log('\n📊 RESTAURANT STATUS ANALYSIS:');
    const totalRestaurants = await Restaurant.countDocuments();
    const pendingRestaurants = await Restaurant.countDocuments({ status: 'pending' });
    const approvedRestaurants = await Restaurant.countDocuments({ status: 'approved' });
    const rejectedRestaurants = await Restaurant.countDocuments({ status: 'rejected' });

    console.log(`Total Restaurants: ${totalRestaurants}`);
    console.log(`Pending: ${pendingRestaurants}`);
    console.log(`Approved: ${approvedRestaurants}`);
    console.log(`Rejected: ${rejectedRestaurants}`);

    // Show actual restaurant statuses
    const restaurants = await Restaurant.find({}, 'name status').limit(10);
    console.log('\nFirst 10 restaurants:');
    restaurants.forEach(r => console.log(`- ${r.name}: ${r.status}`));

    // Test order status counts and revenue
    console.log('\n📦 ORDER STATUS ANALYSIS:');
    const totalOrders = await Order.countDocuments();
    console.log(`Total Orders: ${totalOrders}`);

    const orderStatusCounts = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    console.log('Order status breakdown:');
    orderStatusCounts.forEach(status => console.log(`- ${status._id}: ${status.count}`));

    // Test revenue calculation
    const revenueResult = await Order.aggregate([
      { $match: { status: 'Delivered' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;
    console.log(`\n💰 Total Revenue from Delivered Orders: ₹${totalRevenue}`);

    // Show some sample orders
    const sampleOrders = await Order.find({}, 'status totalAmount createdAt').limit(5);
    console.log('\nSample orders:');
    sampleOrders.forEach(order => console.log(`- Status: ${order.status}, Amount: ₹${order.totalAmount}, Date: ${order.createdAt}`));

    // Test user counts
    console.log('\n👥 USER ANALYSIS:');
    const totalUsers = await User.countDocuments();
    console.log(`Total Users: ${totalUsers}`);

    const userRoleCounts = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    console.log('User role breakdown:');
    userRoleCounts.forEach(role => console.log(`- ${role._id}: ${role.count}`));

    console.log('\n✅ Data aggregation test completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error testing data aggregation:', error);
    process.exit(1);
  }
};

testDataAggregation();