// server/models/restaurant.model.js

const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image: { type: String },
  isAvailable: { type: Boolean, default: true }, 
});

const ratingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
}, { timestamps: true });

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [0, 0], // Default coordinates, can be updated later
      },
    },
  },
  cuisine: {
    type: [String],
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  menuItems: [menuItemSchema],
  ratings: [ratingSchema],
  averageRating: {
    type: Number,
    default: 4.0,
  },
  // NEW ADDITIVE FIELDS FOR DYNAMIC RATING SYSTEM
  totalRatingSum: {
    type: Number,
    default: 16, // 4 stars * 4 initial ratings = 16
  },
  totalRatingCount: {
    type: Number,
    default: 4, // Start with 4 initial ratings
  },
  
  fssaiLicenseNumber: {
    type: String,
    required: true,
  },
  gstNumber: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'pending_approval', 'approved', 'rejected'],
    default: 'pending',
  },
  isOpen: {
    type: Boolean,
    default: true,
  },
  operatingHours: {
    open: { type: String, default: '09:00' },
    close: { type: String, default: '22:00' },
  },
  documents: {
    fssaiLicense: { type: String }, // File path or URL
    restaurantPhoto: { type: String }, // File path or URL
    shopEstablishmentUrl: { type: String },
    gstCertificateUrl: { type: String },
    ownerPhotoUrl: { type: String },
  },
}, {
  timestamps: true,
});

restaurantSchema.index({ 'address.location': '2dsphere' });

module.exports = mongoose.models.Restaurant || mongoose.model('Restaurant', restaurantSchema);
