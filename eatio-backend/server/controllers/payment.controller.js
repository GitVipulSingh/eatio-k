// server/controllers/payment.controller.js

const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/order.model');
const mongoose = require('mongoose'); // Import mongoose

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
        return res.status(400).json({ message: 'A valid amount is required.' });
    }

    const options = {
      amount: Math.round(amount * 100), // Amount in the smallest currency unit
      currency: 'INR',
      receipt: `receipt_order_${new Date().getTime()}`,
    };

    const order = await razorpay.orders.create(options);
    if (!order) {
      return res.status(500).json({ message: 'Error creating Razorpay order.' });
    }

    res.json(order);
  } catch (error) {
    console.error('Razorpay Order Creation Error:', error);
    res.status(500).json({ message: 'Server error during Razorpay order creation.' });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderItems,
      restaurantId,
      deliveryAddress,
      totalAmount,
    } = req.body;

    console.log(`💳 [VERIFY_PAYMENT] Starting payment verification for user ${req.user._id}`);

    // 1. Verify the signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.log(`❌ [VERIFY_PAYMENT] Invalid signature`);
      return res.status(400).json({ message: 'Payment verification failed. Invalid signature.' });
    }

    // 2. Validate incoming data BEFORE trying to save
    if (!restaurantId || !mongoose.Types.ObjectId.isValid(restaurantId)) {
        console.log(`❌ [VERIFY_PAYMENT] Invalid restaurant ID: ${restaurantId}`);
        return res.status(400).json({ message: 'Invalid or missing Restaurant ID.' });
    }
    if (!orderItems || orderItems.length === 0) {
        console.log(`❌ [VERIFY_PAYMENT] Empty order items`);
        return res.status(400).json({ message: 'Order items cannot be empty.' });
    }

    console.log(`✅ [VERIFY_PAYMENT] Payment signature verified successfully`);

    // 3. Check if order with this payment ID already exists (prevent duplicates)
    const existingOrder = await Order.findOne({ 
      'paymentDetails.paymentId': razorpay_payment_id 
    });
    
    if (existingOrder) {
      console.log(`⚠️ [VERIFY_PAYMENT] Order already exists for payment ID: ${razorpay_payment_id}`);
      return res.status(200).json({
        message: 'Order already processed for this payment',
        order: existingOrder,
      });
    }

    // 4. Create the order with PENDING status (restaurant needs to confirm)
    const newOrder = new Order({
      user: req.user._id,
      restaurant: restaurantId,
      items: orderItems,
      totalAmount: totalAmount,
      deliveryAddress: deliveryAddress,
      paymentDetails: {
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        signature: razorpay_signature,
        status: 'Paid',
        method: 'Razorpay',
      },
      status: 'Pending', // Set to Pending - restaurant admin must confirm
    });

    const savedOrder = await newOrder.save();

    // Populate the order with user and restaurant details for real-time updates
    const populatedOrder = await Order.findById(savedOrder._id)
      .populate('user', 'name email phone')
      .populate('restaurant', 'name');

    console.log(`✅ [VERIFY_PAYMENT] Order created successfully: ${savedOrder._id} with status: ${savedOrder.status}`);

    // Emit real-time update for restaurant admin dashboard
    const io = req.app.get('socketio');
    if (io) {
      // Emit to specific restaurant room for targeted updates
      io.to(`restaurant_${populatedOrder.restaurant._id}`).emit('new_order', {
        orderId: populatedOrder._id,
        restaurantId: populatedOrder.restaurant._id,
        restaurantName: populatedOrder.restaurant.name,
        customerName: populatedOrder.user.name,
        totalAmount: populatedOrder.totalAmount,
        itemsCount: populatedOrder.items.length,
        status: populatedOrder.status,
        paymentStatus: 'Paid',
        timestamp: new Date()
      });
      
      // Also emit to Super Admin for system-wide stats
      io.emit('system_stats_update', {
        type: 'new_order',
        orderId: populatedOrder._id,
        restaurantId: populatedOrder.restaurant._id,
        totalAmount: populatedOrder.totalAmount,
        timestamp: new Date()
      });
      
      console.log(`📡 [VERIFY_PAYMENT] Socket events emitted for new order to restaurant_${populatedOrder.restaurant._id}`);
    }

    res.status(201).json({
      message: 'Payment successful and order created!',
      order: savedOrder,
    });

  } catch (error) {
    console.error('❌ [VERIFY_PAYMENT] Error during payment verification:', error);
    // Provide a more specific error message if it's a validation issue
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Order validation failed.', details: error.message });
    }
    res.status(500).json({ message: 'Server error during payment verification.' });
  }
};

module.exports = { createRazorpayOrder, verifyPayment };