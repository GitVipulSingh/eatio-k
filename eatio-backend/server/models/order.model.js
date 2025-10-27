// server/models/order.model.js

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
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
  items: [{
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
  }],
  totalAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Pending',
  },
  deliveryAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
  },
  paymentDetails: {
    paymentId: { type: String },
    orderId: { type: String },
    signature: { type: String },
    status: { type: String },
    method: { type: String },
  },
}, {
  timestamps: true,
});

// Create a sparse unique index on paymentId to prevent duplicate orders for the same payment
// Sparse index allows multiple null values but ensures uniqueness for non-null values
orderSchema.index({ 'paymentDetails.paymentId': 1 }, { 
  unique: true, 
  sparse: true,
  name: 'unique_payment_id'
});

// This updated line prevents the OverwriteModelError
module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);
