// server/controllers/admin.controller.js
const Restaurant = require('../models/restaurant.model');
const Order = require('../models/order.model');
const User = require('../models/user.model');

// --- Functions for Super Admin ---
const getPendingRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ status: 'pending' }).populate('owner', 'name email phone');
    res.status(200).json(restaurants);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching pending restaurants.' });
  }
};

// Get system statistics for super admin dashboard
const getSystemStats = async (req, res) => {
  try {
    // Get total restaurants count
    const totalRestaurants = await Restaurant.countDocuments();
    
    // Get pending approvals count
    const pendingApprovals = await Restaurant.countDocuments({ status: 'pending' });
    
    // Get active restaurants count
    const activeRestaurants = await Restaurant.countDocuments({ status: 'approved' });
    
    // Get total users count
    const totalUsers = await User.countDocuments();
    
    // Get total orders count
    const totalOrders = await Order.countDocuments();
    
    // Get today's orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow }
    });
    
    // Calculate total revenue
    const revenueResult = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;
    
    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentOrders = await Order.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });
    
    const recentRegistrations = await Restaurant.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    res.status(200).json({
      totalRestaurants,
      pendingApprovals,
      activeRestaurants,
      totalUsers,
      totalOrders,
      todayOrders,
      totalRevenue,
      recentActivity: {
        orders: recentOrders,
        registrations: recentRegistrations
      }
    });
  } catch (error) {
    console.error('Error fetching system stats:', error);
    res.status(500).json({ message: 'Server error fetching system statistics.' });
  }
};

// Get all restaurants with detailed information
const getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find()
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 });
    res.status(200).json(restaurants);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching restaurants.' });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching users.' });
  }
};

// Get all orders for super admin
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email phone')
      .populate('restaurant', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching orders.' });
  }
};

const updateRestaurantStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const restaurant = await Restaurant.findById(req.params.id);
    if (restaurant) {
      restaurant.status = status;
      await restaurant.save();
      res.json({ message: `Restaurant has been ${status}.` });
    } else {
      res.status(404).json({ message: 'Restaurant not found.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error updating restaurant status.' });
  }
};


// --- Functions for Regular Admin ---
const updateOrderStatus = async (req, res) => {
  try {
    console.log(`📝 [UPDATE_STATUS] Updating order ${req.params.id} to status: ${req.body.status}`);
    console.log(`📝 [UPDATE_STATUS] Restaurant ID: ${req.user.restaurant}`);
    
    const { status } = req.body;
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('restaurant', 'name');

    if (!order) {
      console.log(`❌ [UPDATE_STATUS] Order not found: ${req.params.id}`);
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify the order belongs to this restaurant
    if (order.restaurant._id.toString() !== req.user.restaurant.toString()) {
      console.log(`❌ [UPDATE_STATUS] Unauthorized: Order belongs to different restaurant`);
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }

    const oldStatus = order.status;
    order.status = status;
    order.updatedAt = new Date();
    
    const updatedOrder = await order.save();
    
    console.log(`✅ [UPDATE_STATUS] Order status updated from ${oldStatus} to ${status}`);
    
    // Emit socket event for real-time updates
    const io = req.app.get('socketio');
    if (io) {
      io.to(order._id.toString()).emit('order_status_updated', updatedOrder);
      console.log(`📡 [UPDATE_STATUS] Socket event emitted for order ${order._id}`);
    }
    
    res.json({
      message: `Order status updated to ${status}`,
      order: updatedOrder
    });
  } catch (error) {
    console.error("❌ [UPDATE_STATUS] Error updating order status:", error);
    res.status(500).json({ message: 'Server error updating order status' });
  }
};

const getRestaurantOrders = async (req, res) => {
    try {
      console.log(`📋 [GET_ORDERS] Fetching orders for restaurant ID: ${req.user.restaurant}`);
      console.log(`📋 [GET_ORDERS] User details:`, {
        id: req.user._id,
        role: req.user.role,
        restaurant: req.user.restaurant
      });
      
      const orders = await Order.find({ restaurant: req.user.restaurant })
        .populate('user', 'name email phone')
        .populate('restaurant', 'name')
        .sort({ createdAt: -1 });
      
      console.log(`📋 [GET_ORDERS] Found ${orders.length} orders for this restaurant`);
      
      // Log first few orders for debugging
      orders.slice(0, 3).forEach((order, index) => {
        console.log(`📋 [GET_ORDERS] Order ${index}:`, {
          id: order._id,
          status: order.status,
          totalAmount: order.totalAmount,
          itemsCount: order.items?.length,
          customerName: order.user?.name
        });
      });
      
      res.json(orders);
    } catch (error) {
      console.error("❌ [GET_ORDERS] Error fetching restaurant orders:", error);
      res.status(500).json({ message: 'Server error fetching orders.' });
    }
};

// Update restaurant open/closed status
const updateRestaurantOpenStatus = async (req, res) => {
  try {
    const { isOpen, operatingHours } = req.body;
    const restaurant = await Restaurant.findById(req.user.restaurant);
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found.' });
    }
    
    restaurant.isOpen = isOpen;
    if (operatingHours) {
      restaurant.operatingHours = operatingHours;
    }
    
    await restaurant.save();
    
    res.json({ 
      message: `Restaurant is now ${isOpen ? 'open' : 'closed'}`,
      restaurant: {
        isOpen: restaurant.isOpen,
        operatingHours: restaurant.operatingHours
      }
    });
  } catch (error) {
    console.error("Update Restaurant Status Error:", error);
    res.status(500).json({ message: 'Server error updating restaurant status.' });
  }
};

module.exports = {
  getPendingRestaurants,
  updateRestaurantStatus,
  updateOrderStatus,
  getRestaurantOrders,
  getSystemStats,
  getAllRestaurants,
  getAllUsers,
  getAllOrders,
  updateRestaurantOpenStatus,
};