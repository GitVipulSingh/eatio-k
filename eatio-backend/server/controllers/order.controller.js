// server/controllers/order.controller.js
const Order = require('../models/order.model');
const Restaurant = require('../models/restaurant.model');

// This function can be kept for future features like "Cash on Delivery".
const createOrder = async (req, res) => {
  // ... existing code ...
  try {
    const { restaurantId, items, deliveryAddress } = req.body;
    const userId = req.user._id;
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    let totalAmount = 0;
    const orderItems = items.map(item => {
      const menuItem = restaurant.menuItems.find(mi => mi._id.toString() === item.menuItemId);
      if (!menuItem) throw new Error(`Menu item with ID ${item.menuItemId} not found.`);
      totalAmount += menuItem.price * item.quantity;
      return { name: menuItem.name, price: menuItem.price, quantity: item.quantity };
    });
    const order = new Order({ user: userId, restaurant: restaurantId, items: orderItems, totalAmount, deliveryAddress });
    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while creating order.' });
  }
};

const getOrderHistory = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('restaurant', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error("Get Order History Error:", error);
    res.status(500).json({ message: 'Server error fetching order history.' });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('restaurant', 'name address');

    if (order) {
      // --- THIS IS THE FIX ---
      // We are reverting the security logic. This route is for the customer who created the order.
      // The restaurant admin has their own separate, secure routes.
      if (order.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to view this order.' });
      }
      res.json(order);
      // --- END OF FIX ---
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error("Get Order By ID Error:", error);
    res.status(500).json({ message: 'Server error fetching order.' });
  }
};

module.exports = { createOrder, getOrderHistory, getOrderById };