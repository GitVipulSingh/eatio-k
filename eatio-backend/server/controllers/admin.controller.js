// server/controllers/admin.controller.js
const Restaurant = require('../models/restaurant.model');
const Order = require('../models/order.model');
const User = require('../models/user.model');

// --- Functions for Super Admin ---
const getPendingRestaurants = async (req, res) => {
  try {
    console.log('🔍 [PENDING_RESTAURANTS] Fetching pending restaurants...');
    const restaurants = await Restaurant.find({ 
      status: { $in: ['pending', 'pending_approval'] } 
    }).populate('owner', 'name email phone');
    console.log(`🔍 [PENDING_RESTAURANTS] Found ${restaurants.length} pending restaurants`);
    res.status(200).json(restaurants);
  } catch (error) {
    console.error('❌ [PENDING_RESTAURANTS] Error:', error);
    res.status(500).json({ message: 'Server error fetching pending restaurants.' });
  }
};

// Get system statistics for super admin dashboard
const getSystemStats = async (req, res) => {
  try {
    console.log('📊 [SYSTEM_STATS] Starting system stats calculation...');
    
    // Get total restaurants count
    const totalRestaurants = await Restaurant.countDocuments();
    console.log(`📊 [SYSTEM_STATS] Total restaurants: ${totalRestaurants}`);
    
    // Get pending approvals count (handle both 'pending' and 'pending_approval')
    const pendingApprovals = await Restaurant.countDocuments({ 
      status: { $in: ['pending', 'pending_approval'] } 
    });
    console.log(`📊 [SYSTEM_STATS] Pending approvals: ${pendingApprovals}`);
    
    // Get active restaurants count
    const activeRestaurants = await Restaurant.countDocuments({ status: 'approved' });
    console.log(`📊 [SYSTEM_STATS] Active restaurants: ${activeRestaurants}`);
    
    // Get total users count
    const totalUsers = await User.countDocuments();
    console.log(`📊 [SYSTEM_STATS] Total users: ${totalUsers}`);
    
    // Get total orders count
    const totalOrders = await Order.countDocuments();
    console.log(`📊 [SYSTEM_STATS] Total orders: ${totalOrders}`);
    
    // Debug: Check all order statuses
    const orderStatusCounts = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    console.log(`📊 [SYSTEM_STATS] Order status breakdown:`, orderStatusCounts);
    
    // Get today's orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow }
    });
    console.log(`📊 [SYSTEM_STATS] Today's orders: ${todayOrders}`);
    
    // Calculate total revenue (fix: use 'Delivered' with capital D)
    const revenueResult = await Order.aggregate([
      { $match: { status: 'Delivered' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;
    
    // Also check if there are any delivered orders at all
    const deliveredOrdersCount = await Order.countDocuments({ status: 'Delivered' });
    console.log(`💰 [SYSTEM_STATS] Revenue calculation:`, { 
      deliveredOrdersCount,
      totalRevenue,
      revenueResult
    });
    
    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentOrders = await Order.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });
    
    const recentRegistrations = await Restaurant.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    const stats = {
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
    };
    
    console.log('📊 [SYSTEM_STATS] Final stats:', stats);
    res.status(200).json(stats);
  } catch (error) {
    console.error('❌ [SYSTEM_STATS] Error fetching system stats:', error);
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
    const restaurant = await Restaurant.findById(req.params.id).populate('owner', 'name email');
    
    if (restaurant) {
      const oldStatus = restaurant.status;
      
      // Use findByIdAndUpdate to avoid full document validation
      await Restaurant.findByIdAndUpdate(
        req.params.id,
        { status: status },
        { runValidators: false }
      );
      
      console.log(`🏪 [RESTAURANT_STATUS] Updated restaurant ${restaurant.name} from ${oldStatus} to ${status}`);
      
      // Emit real-time update for Super Admin dashboard
      const io = req.app.get('socketio');
      if (io) {
        io.emit('restaurant_status_updated', {
          restaurantId: restaurant._id,
          restaurantName: restaurant.name,
          oldStatus,
          newStatus: status,
          timestamp: new Date()
        });
        console.log(`📡 [RESTAURANT_STATUS] Socket event emitted for restaurant status update`);
      }
      
      res.json({ message: `Restaurant has been ${status}.`, restaurant });
    } else {
      res.status(404).json({ message: 'Restaurant not found.' });
    }
  } catch (error) {
    console.error('❌ [RESTAURANT_STATUS] Error updating restaurant status:', error);
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
      // Emit to specific order room for customer tracking
      io.to(order._id.toString()).emit('order_status_updated', {
        orderId: updatedOrder._id,
        oldStatus,
        newStatus: status,
        order: updatedOrder,
        customerName: updatedOrder.user.name,
        restaurantName: updatedOrder.restaurant.name,
        timestamp: new Date()
      });
      
      // Emit to restaurant admin dashboard
      io.to(`restaurant_${updatedOrder.restaurant._id}`).emit('order_status_changed', {
        orderId: updatedOrder._id,
        restaurantId: updatedOrder.restaurant._id,
        oldStatus,
        newStatus: status,
        customerName: updatedOrder.user.name,
        totalAmount: updatedOrder.totalAmount,
        timestamp: new Date()
      });
      
      // If order is delivered, emit system stats update
      if (status === 'Delivered') {
        io.emit('system_stats_update', {
          type: 'order_delivered',
          orderId: updatedOrder._id,
          restaurantId: updatedOrder.restaurant._id,
          totalAmount: updatedOrder.totalAmount,
          timestamp: new Date()
        });
      }
      
      console.log(`📡 [UPDATE_STATUS] Socket events emitted for order ${order._id}`);
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
    
    // Build update object
    const updateData = { isOpen };
    if (operatingHours) {
      updateData.operatingHours = operatingHours;
    }
    
    // Use findByIdAndUpdate to avoid full document validation
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.user.restaurant,
      updateData,
      { 
        new: true, 
        runValidators: false, // Skip validation to avoid address.state requirement
        select: 'isOpen operatingHours name' // Only select needed fields
      }
    );
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found.' });
    }
    
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

// Update restaurant photo
const updateRestaurantPhoto = async (req, res) => {
  try {
    const { imageUrl } = req.body;
    
    // First get the restaurant to check for old photo
    const restaurant = await Restaurant.findById(req.user.restaurant).select('documents name');
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found.' });
    }

    // Delete old photo from Cloudinary if it exists
    if (restaurant.documents?.restaurantPhoto && restaurant.documents.restaurantPhoto.includes('cloudinary.com')) {
      const { deleteFromCloudinary, getPublicIdFromUrl } = require('../config/cloudinary');
      const oldPublicId = getPublicIdFromUrl(restaurant.documents.restaurantPhoto);
      if (oldPublicId) {
        try {
          await deleteFromCloudinary(oldPublicId);
          console.log(`🗑️ [UPDATE_PHOTO] Deleted old restaurant photo: ${oldPublicId}`);
        } catch (deleteError) {
          console.warn(`⚠️ [UPDATE_PHOTO] Failed to delete old photo: ${deleteError.message}`);
          // Continue with update even if deletion fails
        }
      }
    }

    // Use findByIdAndUpdate to avoid full document validation
    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      req.user.restaurant,
      { 
        'documents.restaurantPhoto': imageUrl 
      },
      { 
        new: true, 
        runValidators: false, // Skip validation to avoid address.state requirement
        select: '_id name documents' // Only select needed fields
      }
    );
    
    console.log(`✅ [UPDATE_PHOTO] Restaurant photo updated for: ${updatedRestaurant.name}`);
    
    res.json({ 
      message: 'Restaurant photo updated successfully',
      restaurant: {
        _id: updatedRestaurant._id,
        name: updatedRestaurant.name,
        documents: updatedRestaurant.documents
      }
    });
  } catch (error) {
    console.error("Update Restaurant Photo Error:", error);
    res.status(500).json({ message: 'Server error updating restaurant photo.' });
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
  updateRestaurantPhoto,
};