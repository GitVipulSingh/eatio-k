# Eatio Backend Complete Feature Guide

## Table of Contents
1. [Backend Folder Structure & File Purpose](#backend-folder-structure--file-purpose)
2. [Authentication System Flow](#authentication-system-flow)
3. [User Registration & Login](#user-registration--login)
4. [Role-Based Access Control](#role-based-access-control)
5. [Restaurant Management](#restaurant-management)
6. [Menu Management](#menu-management)
7. [Order Processing System](#order-processing-system)
8. [Payment Integration (Razorpay)](#payment-integration-razorpay)
9. [File Upload & Image Management](#file-upload--image-management)
10. [Search Functionality](#search-functionality)
11. [Real-time Features (Socket.IO)](#real-time-features-socketio)
12. [Admin Panel Features](#admin-panel-features)
13. [Database Schema & Relationships](#database-schema--relationships)
14. [API Endpoints Reference](#api-endpoints-reference)
15. [Security Implementation](#security-implementation)

---

## Backend Folder Structure & File Purpose

### Root Level Files
```
eatio-backend/server/
├── server.js              # Main server entry point, middleware setup
├── package.json           # Dependencies and scripts
├── .env                   # Environment variables (not in repo)
├── .env.example          # Environment template
└── .gitignore            # Git ignore rules
```

### Configuration Files
```
config/
├── db.js                 # MongoDB connection setup
└── cloudinary.js         # Image upload configuration
```

### Data Models (Database Schemas)
```
models/
├── user.model.js         # User schema (customer/admin/superadmin)
├── restaurant.model.js   # Restaurant & menu items schema
├── order.model.js        # Order processing schema
└── review.model.js       # Rating & review system schema
```

### Business Logic (Controllers)
```
controllers/
├── auth.controller.js         # Login, register, logout logic
├── user.controller.js         # User profile management
├── restaurant.controller.js   # Restaurant CRUD operations
├── order.controller.js        # Order creation & management
├── payment.controller.js      # Razorpay integration
├── admin.controller.js        # Admin panel operations
├── search.controller.js       # Search functionality
└── [image].controller.js      # Image upload handlers
```
### API Routes (URL Endpoints)
```
routes/
├── auth.routes.js            # /api/auth/* - Authentication endpoints
├── user.routes.js            # /api/users/* - User profile endpoints
├── restaurant.routes.js      # /api/restaurants/* - Restaurant endpoints
├── order.routes.js           # /api/orders/* - Order endpoints
├── payment.routes.js         # /api/payment/* - Payment endpoints
├── admin.routes.js           # /api/admin/* - Admin panel endpoints
├── search.routes.js          # /api/search/* - Search endpoints
└── [image].routes.js         # /api/*-images/* - Image upload endpoints
```

### Security & Middleware
```
middlewares/
└── auth.middleware.js        # JWT authentication & role checking
```

### Utility Functions
```
utils/
└── generateToken.js          # JWT token generation
```

### Scripts & Tools
```
scripts/
├── create-superadmin.js      # Create initial super admin
├── check-security.js        # Security validation
├── test-cloudinary.js       # Test image upload
└── verify-integration.js    # System integration test
```

---

## Authentication System Flow

### JWT Token-Based Authentication
The system uses **JSON Web Tokens (JWT)** stored in **HTTP-only cookies** for secure authentication.

#### Token Generation Process
```javascript
// File: utils/generateToken.js
const generateToken = (res, userId, role) => {
  // Create JWT with user ID and role
  const token = jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
  
  // Set role-specific cookie name
  const cookieName = `jwt_${role}`;  // jwt_customer, jwt_admin, jwt_superadmin
  
  // Set secure HTTP-only cookie
  res.cookie(cookieName, token, {
    httpOnly: true,                    // Prevents XSS attacks
    secure: process.env.NODE_ENV === 'production',  // HTTPS in production
    sameSite: 'lax',                  // CSRF protection
    maxAge: 30 * 24 * 60 * 60 * 1000  // 30 days
  });
};
```

#### Authentication Middleware
```javascript
// File: middlewares/auth.middleware.js
const isAuthenticated = async (req, res, next) => {
  let token;
  
  // Check for role-specific cookies in priority order
  if (req.cookies.jwt_customer) {
    token = req.cookies.jwt_customer;
  } else if (req.cookies.jwt_admin) {
    token = req.cookies.jwt_admin;
  } else if (req.cookies.jwt_superadmin) {
    token = req.cookies.jwt_superadmin;
  }
  
  if (token) {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach user to request object
    req.user = await User.findById(decoded.userId).select('-password');
    next();
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};
```

---

## User Registration & Login

### Registration Flow
**File Chain**: `routes/auth.routes.js` → `controllers/auth.controller.js` → `models/user.model.js`

#### 1. Registration Endpoint
```javascript
// Route: POST /api/auth/register
// File: routes/auth.routes.js
router.post('/register', registerUser);
```

#### 2. Registration Logic
```javascript
// File: controllers/auth.controller.js
const registerUser = async (req, res) => {
  const { name, email, phone, password, role, restaurantDetails } = req.body;
  
  // Check if user already exists
  const userExists = await User.findOne({ $or: [{ email }, { phone }] });
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }
  
  // For restaurant admin registration
  if (role === 'admin') {
    // Create restaurant first
    const newRestaurant = new Restaurant({
      name: restaurantDetails.name,
      address: restaurantDetails.address,
      cuisine: restaurantDetails.cuisine,
      fssaiLicenseNumber: restaurantDetails.fssaiLicenseNumber,
      status: 'pending'  // Requires super admin approval
    });
    const savedRestaurant = await newRestaurant.save();
    
    // Create admin user linked to restaurant
    const newUser = new User({
      name, email, phone, password, role,
      restaurant: savedRestaurant._id
    });
    await newUser.save();
  } else {
    // Regular customer registration
    const newUser = new User({ name, email, phone, password, role });
    await newUser.save();
  }
  
  // Generate JWT token and set cookie
  generateToken(res, newUser._id, newUser.role);
  res.status(201).json({ message: 'User registered successfully' });
};
```
#### 3. User Model with Password Hashing
```javascript
// File: models/user.model.js
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: false },  // Optional for OTP-based auth
  role: { 
    type: String, 
    enum: ['customer', 'admin', 'superadmin'], 
    default: 'customer' 
  },
  restaurant: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Restaurant',
    required: function() { return this.role === 'admin'; }
  }
});

// Password hashing middleware (runs before save)
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Password comparison method
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
```

### Login Flow
**File Chain**: `routes/auth.routes.js` → `controllers/auth.controller.js` → `utils/generateToken.js`

#### 1. Login Endpoint
```javascript
// Route: POST /api/auth/login
// File: routes/auth.routes.js
router.post('/login', loginUser);
```

#### 2. Login Logic
```javascript
// File: controllers/auth.controller.js
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  
  // Find user by email
  const user = await User.findOne({ email });
  
  if (user && (await user.matchPassword(password))) {
    // For admin users, check if restaurant is approved
    if (user.role === 'admin') {
      const restaurant = await Restaurant.findById(user.restaurant);
      if (restaurant.status !== 'approved') {
        return res.status(403).json({ 
          message: 'Restaurant not approved yet' 
        });
      }
    }
    
    // Generate JWT token and set cookie
    generateToken(res, user._id, user.role);
    
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      message: 'Login successful'
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};
```

### Logout Flow
```javascript
// Route: POST /api/auth/logout
const logoutUser = (req, res) => {
  // Clear all possible role-based cookies
  res.clearCookie('jwt_customer');
  res.clearCookie('jwt_admin');
  res.clearCookie('jwt_superadmin');
  
  res.json({ message: 'Logged out successfully' });
};
```

---

## Role-Based Access Control

### Three User Roles
1. **Customer**: Can browse restaurants, place orders, view order history
2. **Admin**: Restaurant owner, can manage menu, view restaurant orders
3. **SuperAdmin**: Platform admin, can approve restaurants, view all data

### Role-Based Middleware
```javascript
// File: middlewares/auth.middleware.js

// Check if user is restaurant admin with approved restaurant
const isRestaurantAdmin = async (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    if (!req.user.restaurant) {
      return res.status(403).json({ message: 'Admin not linked to restaurant' });
    }
    
    // Check if restaurant is approved
    const restaurant = await Restaurant.findById(req.user.restaurant);
    if (restaurant.status !== 'approved') {
      return res.status(403).json({ message: 'Restaurant not approved' });
    }
    
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
};

// Check if user is super admin
const isSuperAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'superadmin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Super admin role required.' });
  }
};
```

### Route Protection Examples
```javascript
// Public routes (no authentication)
router.get('/restaurants', getAllRestaurants);

// Customer routes (authentication required)
router.get('/orders/history', isAuthenticated, getOrderHistory);

// Admin routes (admin role + approved restaurant)
router.post('/restaurants/menu', isAuthenticated, isRestaurantAdmin, addMenuItem);

// Super admin routes (superadmin role only)
router.get('/admin/restaurants/pending', isAuthenticated, isSuperAdmin, getPendingRestaurants);
```

---

## Restaurant Management

### Restaurant Model Structure
```javascript
// File: models/restaurant.model.js
const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }  // [longitude, latitude]
    }
  },
  cuisine: { type: [String], required: true },  // ['Indian', 'Chinese', 'Italian']
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  menuItems: [menuItemSchema],  // Embedded menu items
  averageRating: { type: Number, default: 0 },
  totalRatingSum: { type: Number, default: 0 },    // For dynamic rating calculation
  totalRatingCount: { type: Number, default: 0 },  // For dynamic rating calculation
  fssaiLicenseNumber: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'pending_approval', 'approved', 'rejected'], 
    default: 'pending' 
  },
  isOpen: { type: Boolean, default: true },
  operatingHours: {
    open: { type: String, default: '09:00' },
    close: { type: String, default: '22:00' }
  },
  documents: {
    fssaiLicense: { type: String },      // Cloudinary URL
    restaurantPhoto: { type: String },   // Cloudinary URL
    shopEstablishmentUrl: { type: String },
    gstCertificateUrl: { type: String },
    ownerPhotoUrl: { type: String }
  }
});

// Geospatial index for location-based queries
restaurantSchema.index({ 'address.location': '2dsphere' });
```
### Restaurant CRUD Operations
**File Chain**: `routes/restaurant.routes.js` → `controllers/restaurant.controller.js`

#### Get All Approved Restaurants
```javascript
// Route: GET /api/restaurants
// File: controllers/restaurant.controller.js
const getAllRestaurants = async (req, res) => {
  try {
    // Only return approved restaurants to public
    const restaurants = await Restaurant.find({ status: 'approved' });
    res.status(200).json(restaurants);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching restaurants' });
  }
};
```

#### Get Restaurant by ID
```javascript
// Route: GET /api/restaurants/:id
const getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (restaurant) {
      res.status(200).json(restaurant);
    } else {
      res.status(404).json({ message: 'Restaurant not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching restaurant' });
  }
};
```

#### Get My Restaurant (Admin Only)
```javascript
// Route: GET /api/restaurants/my-restaurant
// Middleware: isAuthenticated, isRestaurantAdmin
const getMyRestaurant = async (req, res) => {
  try {
    // req.user.restaurant is set during admin registration
    const restaurant = await Restaurant.findById(req.user.restaurant);
    if (restaurant) {
      res.json(restaurant);
    } else {
      res.status(404).json({ message: 'Restaurant not found for this admin' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching restaurant' });
  }
};
```

---

## Menu Management

### Menu Item Schema (Embedded in Restaurant)
```javascript
// File: models/restaurant.model.js
const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  category: { type: String, required: true },  // 'Appetizers', 'Main Course', etc.
  image: { type: String },                     // Cloudinary URL
  isAvailable: { type: Boolean, default: true }
});
```

### Menu CRUD Operations
**File Chain**: `routes/restaurant.routes.js` → `controllers/restaurant.controller.js`

#### Add Menu Item
```javascript
// Route: POST /api/restaurants/menu
// Middleware: isAuthenticated, isRestaurantAdmin
const addMenuItem = async (req, res) => {
  try {
    const { name, description, price, category, image } = req.body;
    
    const restaurant = await Restaurant.findById(req.user.restaurant);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    const newMenuItem = { name, description, price, category, image };
    
    // Use findByIdAndUpdate to add menu item without full validation
    await Restaurant.findByIdAndUpdate(
      req.user.restaurant,
      { $push: { menuItems: newMenuItem } },
      { runValidators: false }
    );
    
    res.status(201).json({ message: 'Menu item added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error adding menu item' });
  }
};
```

#### Update Menu Item
```javascript
// Route: PUT /api/restaurants/menu/:menuItemId
// Middleware: isAuthenticated, isRestaurantAdmin
const updateMenuItem = async (req, res) => {
  try {
    const { menuItemId } = req.params;
    const updateData = req.body;
    
    const restaurant = await Restaurant.findById(req.user.restaurant);
    const menuItem = restaurant.menuItems.id(menuItemId);
    
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    // Handle image deletion if new image is provided
    if (updateData.image && menuItem.image && updateData.image !== menuItem.image) {
      if (menuItem.image.includes('cloudinary.com')) {
        const oldPublicId = getPublicIdFromUrl(menuItem.image);
        if (oldPublicId) {
          await deleteFromCloudinary(oldPublicId);
        }
      }
    }
    
    // Update menu item using MongoDB positional operator
    await Restaurant.findOneAndUpdate(
      { 
        _id: req.user.restaurant,
        'menuItems._id': menuItemId 
      },
      {
        $set: {
          'menuItems.$.name': updateData.name,
          'menuItems.$.description': updateData.description,
          'menuItems.$.price': updateData.price,
          'menuItems.$.category': updateData.category,
          'menuItems.$.image': updateData.image,
          'menuItems.$.isAvailable': updateData.isAvailable
        }
      },
      { runValidators: false }
    );
    
    res.json({ message: 'Menu item updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating menu item' });
  }
};
```

#### Delete Menu Item
```javascript
// Route: DELETE /api/restaurants/menu/:menuItemId
// Middleware: isAuthenticated, isRestaurantAdmin
const deleteMenuItem = async (req, res) => {
  try {
    const { menuItemId } = req.params;
    
    const restaurant = await Restaurant.findById(req.user.restaurant);
    const menuItem = restaurant.menuItems.id(menuItemId);
    
    // Delete associated image from Cloudinary
    if (menuItem && menuItem.image && menuItem.image.includes('cloudinary.com')) {
      const publicId = getPublicIdFromUrl(menuItem.image);
      if (publicId) {
        await deleteFromCloudinary(publicId);
      }
    }
    
    // Remove menu item from array
    await Restaurant.findByIdAndUpdate(
      req.user.restaurant,
      { $pull: { menuItems: { _id: menuItemId } } },
      { runValidators: false }
    );
    
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting menu item' });
  }
};
```

---

## Order Processing System

### Order Model Structure
```javascript
// File: models/order.model.js
const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  items: [{
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Pending' 
  },
  deliveryAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true }
  },
  paymentDetails: {
    paymentId: { type: String },      // Razorpay payment ID
    orderId: { type: String },        // Razorpay order ID
    signature: { type: String },      // Razorpay signature for verification
    status: { type: String },         // Payment status
    method: { type: String }          // Payment method
  }
}, { timestamps: true });

// Unique index to prevent duplicate orders for same payment
orderSchema.index({ 'paymentDetails.paymentId': 1 }, { 
  unique: true, 
  sparse: true 
});
```
### Order Processing Flow
**File Chain**: `routes/order.routes.js` → `controllers/order.controller.js`

#### Create Order
```javascript
// Route: POST /api/orders
// Middleware: isAuthenticated
const createOrder = async (req, res) => {
  try {
    const { restaurantId, items, totalAmount, deliveryAddress, paymentDetails } = req.body;
    
    // Validate restaurant exists and is approved
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant || restaurant.status !== 'approved') {
      return res.status(400).json({ message: 'Restaurant not available' });
    }
    
    // Create new order
    const newOrder = new Order({
      user: req.user._id,
      restaurant: restaurantId,
      items,
      totalAmount,
      deliveryAddress,
      paymentDetails,
      status: 'Pending'
    });
    
    const savedOrder = await newOrder.save();
    
    // Add order to user's order history
    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { orders: savedOrder._id } }
    );
    
    // Emit real-time notification to restaurant admin
    const io = req.app.get('socketio');
    io.emit('new_order', {
      orderId: savedOrder._id,
      restaurantId: restaurantId,
      customerName: req.user.name,
      totalAmount: totalAmount
    });
    
    res.status(201).json({
      message: 'Order created successfully',
      orderId: savedOrder._id
    });
    
  } catch (error) {
    res.status(500).json({ message: 'Server error creating order' });
  }
};
```

#### Get Order History (Customer)
```javascript
// Route: GET /api/orders/history
// Middleware: isAuthenticated
const getOrderHistory = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('restaurant', 'name address')
      .sort({ createdAt: -1 });  // Most recent first
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching order history' });
  }
};
```

#### Get Order by ID
```javascript
// Route: GET /api/orders/:id
// Middleware: isAuthenticated
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name phone')
      .populate('restaurant', 'name address');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if user owns this order or is restaurant admin
    if (order.user._id.toString() !== req.user._id.toString() && 
        order.restaurant._id.toString() !== req.user.restaurant?.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching order' });
  }
};
```

#### Update Order Status (Admin Only)
```javascript
// Route: PUT /api/admin/orders/:id/status
// Middleware: isAuthenticated, isRestaurantAdmin
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;
    
    // Validate status
    const validStatuses = ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    // Find order and verify it belongs to admin's restaurant
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    if (order.restaurant.toString() !== req.user.restaurant.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Update order status
    order.status = status;
    await order.save();
    
    // Emit real-time status update to customer
    const io = req.app.get('socketio');
    io.to(orderId).emit('order_status_updated', {
      orderId: orderId,
      status: status,
      timestamp: new Date()
    });
    
    res.json({ message: 'Order status updated successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating order status' });
  }
};
```

---

## Payment Integration (Razorpay)

### Razorpay Configuration
```javascript
// File: controllers/payment.controller.js
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
```

### Payment Flow
**File Chain**: `routes/payment.routes.js` → `controllers/payment.controller.js`

#### Step 1: Create Razorpay Order
```javascript
// Route: POST /api/payment/create-order
// Middleware: isAuthenticated
const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR' } = req.body;
    
    // Create order in Razorpay
    const options = {
      amount: amount * 100,  // Amount in paise (smallest currency unit)
      currency: currency,
      receipt: `order_${Date.now()}`,
      payment_capture: 1     // Auto capture payment
    };
    
    const razorpayOrder = await razorpay.orders.create(options);
    
    res.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID  // Send public key to frontend
    });
    
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({ message: 'Error creating payment order' });
  }
};
```

#### Step 2: Verify Payment Signature
```javascript
// Route: POST /api/payment/verify-payment
// Middleware: isAuthenticated
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    // Create signature for verification
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');
    
    // Verify signature
    if (expectedSignature === razorpay_signature) {
      // Payment is verified - proceed with order creation
      res.json({
        success: true,
        message: 'Payment verified successfully',
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }
    
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: 'Error verifying payment' });
  }
};
```

### Complete Payment + Order Flow
```javascript
// Frontend Integration Example
const handlePayment = async (orderData) => {
  try {
    // Step 1: Create Razorpay order
    const { data } = await axios.post('/api/payment/create-order', {
      amount: orderData.totalAmount
    });
    
    // Step 2: Initialize Razorpay checkout
    const options = {
      key: data.key,
      amount: data.amount,
      currency: data.currency,
      order_id: data.orderId,
      name: 'Eatio Food Delivery',
      description: 'Food Order Payment',
      handler: async function(response) {
        // Step 3: Verify payment
        const verifyResponse = await axios.post('/api/payment/verify-payment', {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature
        });
        
        if (verifyResponse.data.success) {
          // Step 4: Create order with payment details
          await axios.post('/api/orders', {
            ...orderData,
            paymentDetails: {
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
              status: 'completed',
              method: 'razorpay'
            }
          });
        }
      }
    };
    
    const rzp = new Razorpay(options);
    rzp.open();
    
  } catch (error) {
    console.error('Payment error:', error);
  }
};
```
---

## File Upload & Image Management

### Cloudinary Configuration
**File**: `config/cloudinary.js`

```javascript
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Menu Image Storage Configuration
const menuImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'eatio-backend/menu-images',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'gif'],
    transformation: [
      { width: 800, height: 600, crop: 'fill', quality: 'auto' },
      { fetch_format: 'auto' }
    ],
  },
});

// Restaurant Image Storage Configuration
const restaurantImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'eatio-backend/restaurant-images',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'gif'],
    transformation: [
      { width: 1200, height: 800, crop: 'fill', quality: 'auto' },
      { fetch_format: 'auto' }
    ],
  },
});

// Profile Image Storage Configuration
const profileImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'eatio-backend/profile-images',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [
      { width: 400, height: 400, crop: 'fill', quality: 'auto', gravity: 'face' },
      { fetch_format: 'auto' }
    ],
  },
});

const uploadMenuImage = multer({ storage: menuImageStorage });
const uploadRestaurantImage = multer({ storage: restaurantImageStorage });
const uploadProfileImage = multer({ storage: profileImageStorage });
```

### Image Upload Routes
**File Chain**: `routes/menuImage.routes.js` → `controllers/menuImage.controller.js`

#### Menu Image Upload
```javascript
// Route: POST /api/menu-images/upload
// File: routes/menuImage.routes.js
const express = require('express');
const router = express.Router();
const { uploadMenuImage } = require('../config/cloudinary');
const { uploadMenuImageController } = require('../controllers/menuImage.controller');
const { isAuthenticated, isRestaurantAdmin } = require('../middlewares/auth.middleware');

router.post('/upload', 
  isAuthenticated, 
  isRestaurantAdmin, 
  uploadMenuImage.single('image'), 
  uploadMenuImageController
);

// File: controllers/menuImage.controller.js
const uploadMenuImageController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }
    
    // Cloudinary automatically uploads and returns URL
    const imageUrl = req.file.path;
    const publicId = req.file.filename;
    
    res.json({
      message: 'Image uploaded successfully',
      imageUrl: imageUrl,
      publicId: publicId
    });
    
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ message: 'Error uploading image' });
  }
};
```

### Image Deletion Utility
```javascript
// File: config/cloudinary.js

// Helper function to delete image from Cloudinary
const deleteFromCloudinary = async (publicId) => {
  try {
    console.log(`Deleting image with public ID: ${publicId}`);
    
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      console.log(`Successfully deleted image: ${publicId}`);
    } else if (result.result === 'not found') {
      console.log(`Image not found: ${publicId}`);
    }
    
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

// Helper function to extract public ID from Cloudinary URL
const getPublicIdFromUrl = (url) => {
  try {
    if (!url || !url.includes('cloudinary.com')) {
      return null;
    }
    
    const parts = url.split('/');
    const uploadIndex = parts.findIndex(part => part === 'upload');
    
    if (uploadIndex === -1) return null;
    
    // Get everything after 'upload', skip version if present
    let afterUpload = parts.slice(uploadIndex + 1);
    
    // Skip version number (v1234567890)
    if (afterUpload.length > 0 && /^v\d+$/.test(afterUpload[0])) {
      afterUpload = afterUpload.slice(1);
    }
    
    const publicIdWithExtension = afterUpload.join('/');
    
    // Remove file extension
    const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, '');
    
    return publicId;
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return null;
  }
};
```

---

## Search Functionality

### Search Implementation
**File Chain**: `routes/search.routes.js` → `controllers/search.controller.js`

```javascript
// Route: GET /api/search?q=pizza&location=mumbai&cuisine=italian
// File: controllers/search.controller.js
const searchRestaurants = async (req, res) => {
  try {
    const { q, location, cuisine, minRating, maxDistance } = req.query;
    
    // Build search query
    let searchQuery = { status: 'approved' };  // Only approved restaurants
    
    // Text search in restaurant name and menu items
    if (q) {
      searchQuery.$or = [
        { name: { $regex: q, $options: 'i' } },           // Restaurant name
        { description: { $regex: q, $options: 'i' } },    // Restaurant description
        { 'menuItems.name': { $regex: q, $options: 'i' } }, // Menu item names
        { cuisine: { $in: [new RegExp(q, 'i')] } }        // Cuisine type
      ];
    }
    
    // Location-based search
    if (location) {
      searchQuery.$or = searchQuery.$or || [];
      searchQuery.$or.push(
        { 'address.city': { $regex: location, $options: 'i' } },
        { 'address.state': { $regex: location, $options: 'i' } }
      );
    }
    
    // Cuisine filter
    if (cuisine) {
      searchQuery.cuisine = { $in: [new RegExp(cuisine, 'i')] };
    }
    
    // Rating filter
    if (minRating) {
      searchQuery.averageRating = { $gte: parseFloat(minRating) };
    }
    
    // Execute search with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const restaurants = await Restaurant.find(searchQuery)
      .select('name description address cuisine averageRating menuItems isOpen')
      .sort({ averageRating: -1, name: 1 })  // Sort by rating, then name
      .skip(skip)
      .limit(limit);
    
    const totalCount = await Restaurant.countDocuments(searchQuery);
    
    res.json({
      restaurants,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1
      }
    });
    
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Error performing search' });
  }
};
```

### Advanced Search Features
```javascript
// Geospatial search (find restaurants near coordinates)
const searchNearby = async (req, res) => {
  try {
    const { lat, lng, maxDistance = 5000 } = req.query; // maxDistance in meters
    
    const restaurants = await Restaurant.find({
      status: 'approved',
      'address.location': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    });
    
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: 'Error in location-based search' });
  }
};

// Search with aggregation pipeline for complex queries
const advancedSearch = async (req, res) => {
  try {
    const { q, minPrice, maxPrice, cuisine } = req.query;
    
    const pipeline = [
      // Match approved restaurants
      { $match: { status: 'approved' } },
      
      // Unwind menu items for item-level filtering
      { $unwind: '$menuItems' },
      
      // Filter by price range
      {
        $match: {
          'menuItems.price': {
            $gte: parseFloat(minPrice) || 0,
            $lte: parseFloat(maxPrice) || 10000
          }
        }
      },
      
      // Group back by restaurant
      {
        $group: {
          _id: '$_id',
          name: { $first: '$name' },
          address: { $first: '$address' },
          cuisine: { $first: '$cuisine' },
          averageRating: { $first: '$averageRating' },
          menuItems: { $push: '$menuItems' }
        }
      },
      
      // Sort by rating
      { $sort: { averageRating: -1 } }
    ];
    
    const restaurants = await Restaurant.aggregate(pipeline);
    res.json(restaurants);
    
  } catch (error) {
    res.status(500).json({ message: 'Error in advanced search' });
  }
};
```
---

## Real-time Features (Socket.IO)

### Socket.IO Setup
**File**: `server.js`

```javascript
const { Server } = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);

// Configure Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,  // Frontend URLs
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Socket connection handling
io.on('connection', (socket) => {
  console.log('✅ Socket connected:', socket.id);

  // Join order-specific room for real-time updates
  socket.on('join_order_room', (orderId) => {
    socket.join(orderId);
    console.log(`User joined order room: ${orderId}`);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('❌ Socket disconnected:', socket.id);
  });
});

// Make io available to controllers
app.set('socketio', io);
```

### Real-time Order Updates
```javascript
// File: controllers/order.controller.js

// When new order is created
const createOrder = async (req, res) => {
  // ... order creation logic ...
  
  // Emit real-time notification to restaurant admin
  const io = req.app.get('socketio');
  io.emit('new_order', {
    orderId: savedOrder._id,
    restaurantId: restaurantId,
    customerName: req.user.name,
    totalAmount: totalAmount,
    items: items,
    timestamp: new Date()
  });
  
  // ... rest of the function ...
};

// When order status is updated
const updateOrderStatus = async (req, res) => {
  // ... status update logic ...
  
  // Emit real-time status update to customer
  const io = req.app.get('socketio');
  io.to(orderId).emit('order_status_updated', {
    orderId: orderId,
    status: status,
    message: `Your order is now ${status.toLowerCase()}`,
    timestamp: new Date()
  });
  
  // ... rest of the function ...
};
```

### Frontend Socket Integration
```javascript
// Frontend Socket.IO client setup
import io from 'socket.io-client';

const socket = io(process.env.REACT_APP_API_URL, {
  withCredentials: true
});

// Join order room for real-time updates
const joinOrderRoom = (orderId) => {
  socket.emit('join_order_room', orderId);
};

// Listen for order status updates
socket.on('order_status_updated', (data) => {
  console.log('Order status updated:', data);
  // Update UI with new status
  setOrderStatus(data.status);
  showNotification(`Order ${data.status.toLowerCase()}`);
});

// Listen for new orders (restaurant admin)
socket.on('new_order', (data) => {
  console.log('New order received:', data);
  // Update orders list
  setOrders(prevOrders => [data, ...prevOrders]);
  playNotificationSound();
});
```

---

## Admin Panel Features

### Super Admin Functions
**File Chain**: `routes/admin.routes.js` → `controllers/admin.controller.js`

#### Restaurant Approval System
```javascript
// Route: GET /api/admin/restaurants/pending
// Middleware: isAuthenticated, isSuperAdmin
const getPendingRestaurants = async (req, res) => {
  try {
    const pendingRestaurants = await Restaurant.find({ 
      status: { $in: ['pending', 'pending_approval'] } 
    }).populate('owner', 'name email phone');
    
    res.json(pendingRestaurants);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending restaurants' });
  }
};

// Route: PUT /api/admin/restaurants/:id/status
// Middleware: isAuthenticated, isSuperAdmin
const updateRestaurantStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const restaurantId = req.params.id;
    
    // Validate status
    const validStatuses = ['approved', 'rejected', 'pending'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const updateData = { status };
    if (status === 'rejected' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }
    
    const restaurant = await Restaurant.findByIdAndUpdate(
      restaurantId,
      updateData,
      { new: true }
    ).populate('owner', 'name email');
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    // Send notification email to restaurant owner
    // await sendStatusUpdateEmail(restaurant.owner.email, status, rejectionReason);
    
    res.json({
      message: `Restaurant ${status} successfully`,
      restaurant
    });
    
  } catch (error) {
    res.status(500).json({ message: 'Error updating restaurant status' });
  }
};
```

#### System Statistics
```javascript
// Route: GET /api/admin/stats
// Middleware: isAuthenticated, isSuperAdmin
const getSystemStats = async (req, res) => {
  try {
    // Aggregate statistics from multiple collections
    const stats = await Promise.all([
      // Total restaurants by status
      Restaurant.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Total users by role
      User.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Orders by status
      Order.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalRevenue: { $sum: '$totalAmount' }
          }
        }
      ]),
      
      // Monthly order trends
      Order.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            orderCount: { $sum: 1 },
            revenue: { $sum: '$totalAmount' }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 }
      ])
    ]);
    
    res.json({
      restaurantStats: stats[0],
      userStats: stats[1],
      orderStats: stats[2],
      monthlyTrends: stats[3]
    });
    
  } catch (error) {
    res.status(500).json({ message: 'Error fetching system statistics' });
  }
};
```

### Restaurant Admin Functions
```javascript
// Route: GET /api/admin/orders
// Middleware: isAuthenticated, isRestaurantAdmin
const getRestaurantOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let query = { restaurant: req.user.restaurant };
    
    // Filter by status if provided
    if (status && status !== 'all') {
      query.status = status;
    }
    
    const orders = await Order.find(query)
      .populate('user', 'name phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const totalOrders = await Order.countDocuments(query);
    
    res.json({
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders
      }
    });
    
  } catch (error) {
    res.status(500).json({ message: 'Error fetching restaurant orders' });
  }
};

// Route: PUT /api/admin/restaurant/status
// Middleware: isAuthenticated, isRestaurantAdmin
const updateRestaurantOpenStatus = async (req, res) => {
  try {
    const { isOpen } = req.body;
    
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.user.restaurant,
      { isOpen: Boolean(isOpen) },
      { new: true }
    );
    
    res.json({
      message: `Restaurant ${isOpen ? 'opened' : 'closed'} successfully`,
      isOpen: restaurant.isOpen
    });
    
  } catch (error) {
    res.status(500).json({ message: 'Error updating restaurant status' });
  }
};
```

---

## Database Schema & Relationships

### Entity Relationship Diagram
```
User (1) ←→ (1) Restaurant (for admin users)
User (1) ←→ (M) Order
Restaurant (1) ←→ (M) Order
User (1) ←→ (M) Review
Restaurant (1) ←→ (M) Review
Order (1) ←→ (1) Review
```

### User Schema Details
```javascript
// File: models/user.model.js
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  phone: String (required, unique),
  password: String (hashed),
  role: String (enum: ['customer', 'admin', 'superadmin']),
  restaurant: ObjectId (ref: 'Restaurant', required for admin),
  orders: [ObjectId] (ref: 'Order'),
  createdAt: Date,
  updatedAt: Date
}
```

### Restaurant Schema Details
```javascript
// File: models/restaurant.model.js
{
  _id: ObjectId,
  name: String (required),
  description: String,
  address: {
    street: String (required),
    city: String (required),
    state: String (required),
    pincode: String (required),
    location: {
      type: 'Point',
      coordinates: [Number] // [longitude, latitude]
    }
  },
  cuisine: [String] (required),
  owner: ObjectId (ref: 'User', required),
  menuItems: [{
    _id: ObjectId,
    name: String (required),
    description: String,
    price: Number (required),
    category: String (required),
    image: String (Cloudinary URL),
    isAvailable: Boolean (default: true)
  }],
  averageRating: Number (default: 0),
  totalRatingSum: Number (default: 0),
  totalRatingCount: Number (default: 0),
  fssaiLicenseNumber: String (required),
  status: String (enum: ['pending', 'approved', 'rejected']),
  isOpen: Boolean (default: true),
  operatingHours: {
    open: String (default: '09:00'),
    close: String (default: '22:00')
  },
  documents: {
    fssaiLicense: String (Cloudinary URL),
    restaurantPhoto: String (Cloudinary URL),
    // ... other document URLs
  },
  createdAt: Date,
  updatedAt: Date
}
```
### Order Schema Details
```javascript
// File: models/order.model.js
{
  _id: ObjectId,
  user: ObjectId (ref: 'User', required),
  restaurant: ObjectId (ref: 'Restaurant', required),
  items: [{
    name: String (required),
    price: Number (required),
    quantity: Number (required)
  }],
  totalAmount: Number (required),
  status: String (enum: ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled']),
  deliveryAddress: {
    street: String (required),
    city: String (required),
    pincode: String (required)
  },
  paymentDetails: {
    paymentId: String (Razorpay payment ID),
    orderId: String (Razorpay order ID),
    signature: String (Razorpay signature),
    status: String (payment status),
    method: String (payment method)
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Review Schema Details
```javascript
// File: models/review.model.js
{
  _id: ObjectId,
  user: ObjectId (ref: 'User', required),
  restaurant: ObjectId (ref: 'Restaurant', required),
  order: ObjectId (ref: 'Order', required, unique),
  rating: Number (required, min: 1, max: 5),
  comment: String,
  isVerifiedPurchase: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

---

## API Endpoints Reference

### Authentication Endpoints
```
POST   /api/auth/register          # User registration
POST   /api/auth/login             # User login
POST   /api/auth/logout            # User logout
POST   /api/auth/forgot-password   # Password reset request
POST   /api/auth/reset-password    # Password reset confirmation
```

### User Management Endpoints
```
GET    /api/users/profile          # Get user profile (authenticated)
PUT    /api/users/profile          # Update user profile (authenticated)
```

### Restaurant Endpoints
```
GET    /api/restaurants            # Get all approved restaurants (public)
GET    /api/restaurants/:id        # Get restaurant by ID (public)
GET    /api/restaurants/my-restaurant  # Get admin's restaurant (admin only)
POST   /api/restaurants/menu       # Add menu item (admin only)
PUT    /api/restaurants/menu/:id   # Update menu item (admin only)
DELETE /api/restaurants/menu/:id   # Delete menu item (admin only)
```

### Order Endpoints
```
POST   /api/orders                 # Create new order (authenticated)
GET    /api/orders/history         # Get user's order history (authenticated)
GET    /api/orders/:id             # Get order details (authenticated)
```

### Payment Endpoints
```
POST   /api/payment/create-order   # Create Razorpay order (authenticated)
POST   /api/payment/verify-payment # Verify payment signature (authenticated)
```

### Search Endpoints
```
GET    /api/search                 # Search restaurants
  Query params:
  - q: search term
  - location: city/state
  - cuisine: cuisine type
  - minRating: minimum rating
  - page: page number
  - limit: results per page
```

### Admin Panel Endpoints
```
# Super Admin Only
GET    /api/admin/restaurants/pending     # Get pending restaurants
PUT    /api/admin/restaurants/:id/status  # Approve/reject restaurant
GET    /api/admin/stats                   # Get system statistics
GET    /api/admin/restaurants             # Get all restaurants
GET    /api/admin/users                   # Get all users
GET    /api/admin/orders/all              # Get all orders

# Restaurant Admin Only
GET    /api/admin/orders                  # Get restaurant orders
PUT    /api/admin/orders/:id/status       # Update order status
PUT    /api/admin/restaurant/status       # Update restaurant open/closed
PUT    /api/admin/restaurant/photo        # Update restaurant photo
```

### Image Upload Endpoints
```
POST   /api/menu-images/upload            # Upload menu item image (admin only)
POST   /api/restaurant-images/upload      # Upload restaurant image (admin only)
POST   /api/profile-images/upload         # Upload profile image (authenticated)
POST   /api/registration-images/upload    # Upload registration documents (admin only)
```

---

## Security Implementation

### Password Security
```javascript
// File: models/user.model.js

// Automatic password hashing before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  
  const salt = await bcrypt.genSalt(10);  // Generate salt
  this.password = await bcrypt.hash(this.password, salt);  // Hash password
  next();
});

// Password comparison method
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
```

### JWT Token Security
```javascript
// File: utils/generateToken.js

const generateToken = (res, userId, role) => {
  // Create JWT with expiration
  const token = jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
  
  // Set secure HTTP-only cookie
  res.cookie(`jwt_${role}`, token, {
    httpOnly: true,                    // Prevents XSS attacks
    secure: process.env.NODE_ENV === 'production',  // HTTPS only in production
    sameSite: 'lax',                  // CSRF protection
    maxAge: 30 * 24 * 60 * 60 * 1000  // 30 days
  });
};
```

### Request Security Middleware
```javascript
// File: server.js

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: process.env.NODE_ENV === "development" ? 1 * 60 * 1000 : 15 * 60 * 1000,
  max: process.env.NODE_ENV === "development" ? 500 : 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parsing with size limits
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
```

### Input Validation & Sanitization
```javascript
// Using express-validator for input validation
const { body, validationResult } = require('express-validator');

// Validation rules for user registration
const validateUserRegistration = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  body('phone').isMobilePhone('en-IN'),
  body('name').trim().isLength({ min: 2, max: 50 }).escape()
];

// Check validation results
const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Validation failed',
      errors: errors.array() 
    });
  }
  next();
};

// Usage in routes
router.post('/register', validateUserRegistration, checkValidation, registerUser);
```

### Database Security
```javascript
// MongoDB injection prevention through Mongoose
// Mongoose automatically sanitizes queries

// Additional sanitization for user input
const mongoSanitize = require('express-mongo-sanitize');
app.use(mongoSanitize());

// Prevent parameter pollution
const hpp = require('hpp');
app.use(hpp());
```

### File Upload Security
```javascript
// File type validation in Cloudinary configuration
const menuImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'eatio-backend/menu-images',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'gif'],  // Restrict file types
    transformation: [
      { width: 800, height: 600, crop: 'fill', quality: 'auto' }  // Resize images
    ],
  },
});

// File size limits
const uploadRegistrationDocument = multer({ 
  storage: registrationDocumentStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});
```

---

## Environment Variables Reference

### Required Environment Variables
```bash
# File: .env

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_here

# Frontend URL
CLIENT_URL=http://localhost:3000

# Razorpay Payment Gateway
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Twilio SMS (Optional)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Cloudinary Image Storage
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Super Admin Credentials (for scripts)
SUPERADMIN_NAME=Super Admin
SUPERADMIN_EMAIL=superadmin@yourdomain.com
SUPERADMIN_PHONE=1234567890
SUPERADMIN_PASSWORD=YourSecurePassword123
```

---

This comprehensive guide covers all major features and flows in the Eatio backend system. Each section includes the complete file chain, code examples, and technical implementation details to help you understand how the system works end-to-end.
---

## Complete User Journey: From Cart to Order Tracking

### Cart Management System (Frontend State Management)

#### Cart State Structure
**File**: `frontend/src/client/store/slices/cartSlice.js`

```javascript
// Redux cart state structure
const cartState = {
  items: [],              // Array of cart items
  totalAmount: 0,         // Total including tax and delivery
  totalItems: 0,          // Total quantity of items
  restaurantId: null,     // Current restaurant ID
  deliveryFee: 30,        // Fixed delivery charge
  taxRate: 0.18,          // 18% GST
}

// Cart item structure
const cartItem = {
  _id: 'menuItemId',
  name: 'Pizza Margherita',
  price: 299,
  quantity: 2,
  totalPrice: 598,        // price * quantity
  image: 'cloudinary_url',
  category: 'Main Course'
}
```

#### User-Specific Cart Persistence
```javascript
// Helper functions for user-specific cart storage
const getUserCartKey = (userId) => {
  return userId ? `eatio-cart-${userId}` : 'eatio-cart'
}

const loadUserCartFromStorage = (userId) => {
  if (!userId) return null
  
  const cartKey = getUserCartKey(userId)
  const savedCart = localStorage.getItem(cartKey)
  
  if (savedCart) {
    try {
      return JSON.parse(savedCart)
    } catch (error) {
      localStorage.removeItem(cartKey)
    }
  }
  return null
}

const saveUserCart = (userId, cartState) => {
  if (!userId) return
  
  const cartKey = getUserCartKey(userId)
  localStorage.setItem(cartKey, JSON.stringify(cartState))
}
```

### Step 1: Adding Items to Cart

#### Frontend Cart Actions
```javascript
// File: frontend/src/client/store/slices/cartSlice.js

// Add item to cart action
addToCart: (state, action) => {
  // Prevent adding to cart if user is not authenticated
  if (!isUserAuthenticated()) {
    console.warn('Cannot add to cart: User not authenticated')
    return state
  }

  const { item, restaurantId } = action.payload
  const quantityToAdd = item.quantity || 1
  
  // If cart has items from different restaurant, clear cart
  if (state.restaurantId && state.restaurantId !== restaurantId) {
    state.items = []
    state.totalAmount = 0
    state.totalItems = 0
  }
  
  state.restaurantId = restaurantId
  
  // Check if item already exists in cart
  const existingItem = state.items.find(cartItem => cartItem._id === item._id)
  
  if (existingItem) {
    // Update quantity of existing item
    existingItem.quantity += quantityToAdd
    existingItem.totalPrice = Math.round(existingItem.quantity * existingItem.price * 100) / 100
  } else {
    // Add new item to cart
    state.items.push({
      ...item,
      quantity: quantityToAdd,
      totalPrice: Math.round(item.price * quantityToAdd * 100) / 100
    })
  }
  
  // Recalculate totals
  cartSlice.caseReducers.calculateTotals(state)
  
  // Save to user-specific localStorage
  const userId = getCurrentUserId()
  if (userId) {
    saveUserCart(userId, state)
  }
}
```

#### Cart Total Calculation
```javascript
// Calculate cart totals including tax and delivery
calculateTotals: (state) => {
  const subtotal = state.items.reduce((total, item) => total + item.totalPrice, 0)
  const tax = subtotal * state.taxRate  // 18% GST
  state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0)
  
  // Add delivery fee only if cart has items
  state.totalAmount = Math.round((subtotal + tax + (subtotal > 0 ? state.deliveryFee : 0)) * 100) / 100
}
```

### Step 2: Checkout Process

#### Checkout Page Flow
**File Chain**: `frontend/src/client/pages/CheckoutPage.jsx` → `backend/api/payment/create-order`

```javascript
// Checkout page component structure
const CheckoutPage = () => {
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    city: '',
    pincode: ''
  })
  const [paymentMethod, setPaymentMethod] = useState('razorpay')
  const [isProcessing, setIsProcessing] = useState(false)
  
  const cartItems = useSelector(state => state.cart.items)
  const totalAmount = useSelector(state => state.cart.totalAmount)
  const restaurantId = useSelector(state => state.cart.restaurantId)
  
  const handlePlaceOrder = async () => {
    // Validate delivery address
    if (!deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.pincode) {
      toast.error('Please fill in complete delivery address')
      return
    }
    
    // Validate cart
    if (cartItems.length === 0) {
      toast.error('Your cart is empty')
      return
    }
    
    setIsProcessing(true)
    
    try {
      // Step 1: Create Razorpay order
      const { data: paymentOrder } = await axios.post('/api/payment/create-order', {
        amount: totalAmount,
        currency: 'INR'
      })
      
      // Step 2: Initialize Razorpay checkout
      const options = {
        key: paymentOrder.key,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        order_id: paymentOrder.orderId,
        name: 'Eatio Food Delivery',
        description: 'Food Order Payment',
        handler: async function(response) {
          await handlePaymentSuccess(response, paymentOrder)
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone
        },
        theme: {
          color: '#f59e0b'
        }
      }
      
      const rzp = new window.Razorpay(options)
      rzp.open()
      
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Failed to initiate payment')
    } finally {
      setIsProcessing(false)
    }
  }
}
```

### Step 3: Payment Processing with Razorpay

#### Payment Success Handler
```javascript
const handlePaymentSuccess = async (razorpayResponse, paymentOrder) => {
  try {
    // Step 1: Verify payment signature
    const verifyResponse = await axios.post('/api/payment/verify-payment', {
      razorpay_order_id: razorpayResponse.razorpay_order_id,
      razorpay_payment_id: razorpayResponse.razorpay_payment_id,
      razorpay_signature: razorpayResponse.razorpay_signature
    })
    
    if (verifyResponse.data.success) {
      // Step 2: Create order with payment details
      const orderData = {
        restaurantId: restaurantId,
        items: cartItems.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        totalAmount: totalAmount,
        deliveryAddress: deliveryAddress,
        paymentDetails: {
          paymentId: razorpayResponse.razorpay_payment_id,
          orderId: razorpayResponse.razorpay_order_id,
          signature: razorpayResponse.razorpay_signature,
          status: 'completed',
          method: 'razorpay'
        }
      }
      
      const { data: order } = await axios.post('/api/orders', orderData)
      
      // Step 3: Clear cart and redirect
      dispatch(clearCart())
      toast.success('Order placed successfully!')
      navigate(`/orders/${order.orderId}`)
      
    } else {
      throw new Error('Payment verification failed')
    }
    
  } catch (error) {
    console.error('Payment processing error:', error)
    toast.error('Payment verification failed. Please contact support.')
  }
}
```

### Step 4: Order Creation Backend Flow

#### Complete Order Creation Process
**File Chain**: `routes/order.routes.js` → `controllers/order.controller.js` → `models/order.model.js`

```javascript
// File: controllers/order.controller.js
const createOrder = async (req, res) => {
  try {
    const { restaurantId, items, totalAmount, deliveryAddress, paymentDetails } = req.body
    
    // Step 1: Validate restaurant exists and is approved
    const restaurant = await Restaurant.findById(restaurantId)
    if (!restaurant || restaurant.status !== 'approved') {
      return res.status(400).json({ message: 'Restaurant not available' })
    }
    
    // Step 2: Validate menu items and prices
    const validatedItems = []
    let calculatedTotal = 0
    
    for (const orderItem of items) {
      const menuItem = restaurant.menuItems.find(item => 
        item.name === orderItem.name && item.isAvailable
      )
      
      if (!menuItem) {
        return res.status(400).json({ 
          message: `Item "${orderItem.name}" is not available` 
        })
      }
      
      // Verify price hasn't changed
      if (Math.abs(menuItem.price - orderItem.price) > 0.01) {
        return res.status(400).json({ 
          message: `Price for "${orderItem.name}" has changed. Please refresh your cart.` 
        })
      }
      
      validatedItems.push({
        name: orderItem.name,
        price: menuItem.price,
        quantity: orderItem.quantity
      })
      
      calculatedTotal += menuItem.price * orderItem.quantity
    }
    
    // Step 3: Calculate total with tax and delivery
    const tax = calculatedTotal * 0.18  // 18% GST
    const deliveryFee = 30
    const finalTotal = Math.round((calculatedTotal + tax + deliveryFee) * 100) / 100
    
    // Verify total amount matches
    if (Math.abs(finalTotal - totalAmount) > 0.01) {
      return res.status(400).json({ 
        message: 'Total amount mismatch. Please refresh and try again.' 
      })
    }
    
    // Step 4: Create order
    const newOrder = new Order({
      user: req.user._id,
      restaurant: restaurantId,
      items: validatedItems,
      totalAmount: finalTotal,
      deliveryAddress,
      paymentDetails,
      status: 'Pending'
    })
    
    const savedOrder = await newOrder.save()
    
    // Step 5: Add order to user's order history
    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { orders: savedOrder._id } }
    )
    
    // Step 6: Emit real-time notification to restaurant admin
    const io = req.app.get('socketio')
    io.emit('new_order', {
      orderId: savedOrder._id,
      restaurantId: restaurantId,
      customerName: req.user.name,
      customerPhone: req.user.phone,
      totalAmount: finalTotal,
      items: validatedItems,
      deliveryAddress: deliveryAddress,
      timestamp: new Date()
    })
    
    // Step 7: Send confirmation email/SMS (if configured)
    // await sendOrderConfirmation(req.user.email, savedOrder)
    
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      orderId: savedOrder._id,
      estimatedDeliveryTime: '30-45 minutes'
    })
    
  } catch (error) {
    console.error('Order creation error:', error)
    
    // Handle duplicate payment ID error
    if (error.code === 11000 && error.keyPattern?.['paymentDetails.paymentId']) {
      return res.status(400).json({ 
        message: 'This payment has already been processed' 
      })
    }
    
    res.status(500).json({ message: 'Server error creating order' })
  }
}
```

### Step 5: Order History & Tracking

#### Order History Implementation
**File**: `frontend/src/client/pages/OrderHistoryPage.jsx`

```javascript
const OrderHistoryPage = () => {
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false)
  
  // Fetch user's order history
  const { data: orders, isLoading, error } = useOrderHistory()
  
  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'warning',
      'Confirmed': 'info', 
      'Preparing': 'primary',
      'Out for Delivery': 'secondary',
      'Delivered': 'success',
      'Cancelled': 'error'
    }
    return colors[status] || 'default'
  }
  
  const handleTrackOrder = (order) => {
    setSelectedOrder(order)
    setTrackingDialogOpen(true)
  }
  
  const handleReorder = (order) => {
    // Navigate to restaurant and add items to cart
    navigate(`/restaurants/${order.restaurant._id}`)
  }
  
  return (
    <Container>
      {orders?.map(order => (
        <Card key={order._id}>
          <CardContent>
            {/* Order Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h6">{order.restaurant?.name}</Typography>
                <Typography variant="caption">
                  #{order._id.slice(-8).toUpperCase()}
                </Typography>
                <Typography variant="caption">
                  {format(new Date(order.createdAt), 'MMM dd, hh:mm a')}
                </Typography>
              </Box>
              <Chip
                label={order.status}
                color={getStatusColor(order.status)}
                size="small"
              />
            </Box>
            
            {/* Order Items Summary */}
            <Typography variant="body2" color="text.secondary">
              {order.items?.slice(0, 2).map((item, idx) => (
                <span key={idx}>
                  {item.quantity}x {item.name}
                  {idx < Math.min(order.items.length, 2) - 1 ? ', ' : ''}
                </span>
              ))}
              {order.items?.length > 2 && (
                <span> +{order.items.length - 2} more</span>
              )}
            </Typography>
            
            {/* Order Actions */}
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleTrackOrder(order)}
                >
                  Track
                </Button>
              )}
              
              <RateOrderButton order={order} restaurant={order.restaurant} />
              
              <Button
                variant="contained"
                size="small"
                onClick={() => handleReorder(order)}
              >
                Reorder
              </Button>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Container>
  )
}
```

### Step 6: Real-time Order Tracking

#### Order Status Progression
```javascript
// Order status flow
const orderStatuses = [
  'Pending',           // Order placed, waiting for restaurant confirmation
  'Confirmed',         // Restaurant confirmed the order
  'Preparing',         // Food is being prepared
  'Out for Delivery',  // Order is out for delivery
  'Delivered',         // Order delivered successfully
  'Cancelled'          // Order cancelled (can happen at any stage)
]

// Get order tracking steps
const getOrderSteps = (status) => {
  const allSteps = ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered']
  const currentIndex = allSteps.indexOf(status)
  
  return allSteps.map((step, index) => ({
    label: step,
    completed: index <= currentIndex,
    active: index === currentIndex,
    description: getStepDescription(step)
  }))
}

const getStepDescription = (step) => {
  const descriptions = {
    'Pending': 'Your order has been placed and is being processed.',
    'Confirmed': 'Restaurant has confirmed your order.',
    'Preparing': 'Your delicious food is being prepared.',
    'Out for Delivery': 'Your order is on the way!',
    'Delivered': 'Your order has been delivered. Enjoy your meal!'
  }
  return descriptions[step]
}
```

#### Real-time Status Updates with Socket.IO
```javascript
// Frontend socket connection for real-time updates
const socket = io(process.env.REACT_APP_API_URL, {
  withCredentials: true
})

// Join order room for real-time updates
const joinOrderRoom = (orderId) => {
  socket.emit('join_order_room', orderId)
}

// Listen for order status updates
socket.on('order_status_updated', (data) => {
  console.log('Order status updated:', data)
  
  // Update order status in UI
  setOrderStatus(data.status)
  
  // Show notification
  toast.success(`Order ${data.status.toLowerCase()}`)
  
  // Update order history if on that page
  queryClient.invalidateQueries(['orderHistory'])
})

// Backend - Update order status and emit real-time update
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body
    const orderId = req.params.id
    
    // Update order status
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    )
    
    // Emit real-time status update to customer
    const io = req.app.get('socketio')
    io.to(orderId).emit('order_status_updated', {
      orderId: orderId,
      status: status,
      message: `Your order is now ${status.toLowerCase()}`,
      timestamp: new Date(),
      estimatedDeliveryTime: getEstimatedDeliveryTime(status)
    })
    
    res.json({ message: 'Order status updated successfully', order })
  } catch (error) {
    res.status(500).json({ message: 'Error updating order status' })
  }
}
```

---

## Rating & Review System

### Review Model & Implementation
**File**: `models/review.model.js`

```javascript
const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '' },
  isVerifiedPurchase: { type: Boolean, default: true }
}, { timestamps: true })

// Ensure one review per order
reviewSchema.index({ order: 1 }, { unique: true })
```

### Rating Submission Flow
**File Chain**: `frontend/components/rating/RatingModal.jsx` → `backend/api/reviews`

```javascript
// Rating modal component
const RatingModal = ({ open, onClose, order, restaurant }) => {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  
  const submitReviewMutation = useSubmitReview()
  
  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }
    
    try {
      await submitReviewMutation.mutateAsync({
        orderId: order._id,
        rating,
        comment,
      })
      
      toast.success('Thank you for your review!')
      onClose()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review')
    }
  }
  
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Rate Your Experience</DialogTitle>
      <DialogContent>
        {/* Star Rating Component */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Box
              key={star}
              onClick={() => setRating(star)}
              sx={{
                cursor: 'pointer',
                color: star <= rating ? '#fbbf24' : '#e5e7eb',
                '&:hover': { transform: 'scale(1.1)' }
              }}
            >
              <StarIcon style={{ width: '2rem', height: '2rem' }} />
            </Box>
          ))}
        </Box>
        
        {/* Comment Field */}
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Share your experience (optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          inputProps={{ maxLength: 500 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Submit Review
        </Button>
      </DialogActions>
    </Dialog>
  )
}
```

### Backend Review Processing
```javascript
// File: controllers/review.controller.js
const submitReview = async (req, res) => {
  try {
    const { orderId, rating, comment } = req.body
    
    // Validate order exists and belongs to user
    const order = await Order.findById(orderId)
    if (!order || order.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Order not found' })
    }
    
    // Check if order is delivered
    if (order.status !== 'Delivered') {
      return res.status(400).json({ message: 'Can only review delivered orders' })
    }
    
    // Check if review already exists
    const existingReview = await Review.findOne({ order: orderId })
    if (existingReview) {
      return res.status(400).json({ message: 'Order already reviewed' })
    }
    
    // Create review
    const review = new Review({
      user: req.user._id,
      restaurant: order.restaurant,
      order: orderId,
      rating,
      comment,
      isVerifiedPurchase: true
    })
    
    await review.save()
    
    // Update restaurant's average rating
    await updateRestaurantRating(order.restaurant, rating)
    
    res.status(201).json({
      message: 'Review submitted successfully',
      review
    })
    
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Order already reviewed' })
    }
    res.status(500).json({ message: 'Error submitting review' })
  }
}

// Update restaurant's average rating
const updateRestaurantRating = async (restaurantId, newRating) => {
  try {
    const restaurant = await Restaurant.findById(restaurantId)
    
    // Update rating using additive approach
    restaurant.totalRatingSum += newRating
    restaurant.totalRatingCount += 1
    restaurant.averageRating = Math.round((restaurant.totalRatingSum / restaurant.totalRatingCount) * 10) / 10
    
    await restaurant.save()
  } catch (error) {
    console.error('Error updating restaurant rating:', error)
  }
}
```
---

## Additional Missing Features Explained

### User Profile Management

#### Profile Update Flow
**File Chain**: `routes/user.routes.js` → `controllers/user.controller.js`

```javascript
// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password')
    
    if (user) {
      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt
      })
    } else {
      res.status(404).json({ message: 'User not found' })
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user profile' })
  }
}

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body
    
    // Check if email/phone already exists for other users
    const existingUser = await User.findOne({
      $and: [
        { _id: { $ne: req.user._id } },
        { $or: [{ email }, { phone }] }
      ]
    })
    
    if (existingUser) {
      return res.status(400).json({ 
        message: 'Email or phone already in use by another account' 
      })
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { name, email, phone },
      { new: true, runValidators: true }
    ).select('-password')
    
    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    })
    
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile' })
  }
}
```

### Password Reset System

#### Forgot Password Flow
**File Chain**: `routes/auth.routes.js` → `controllers/auth.controller.js`

```javascript
// Generate password reset token
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body
    
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: 'User not found with this email' })
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = Date.now() + 10 * 60 * 1000 // 10 minutes
    
    // Save reset token to user
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    user.resetPasswordExpiry = resetTokenExpiry
    await user.save()
    
    // Send reset email (implement email service)
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`
    
    // await sendPasswordResetEmail(user.email, resetUrl)
    
    res.json({
      message: 'Password reset link sent to your email',
      // In development, return the token
      ...(process.env.NODE_ENV === 'development' && { resetToken })
    })
    
  } catch (error) {
    res.status(500).json({ message: 'Error sending password reset email' })
  }
}

// Reset password with token
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body
    
    // Hash the token to match stored version
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
    
    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiry: { $gt: Date.now() }
    })
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' })
    }
    
    // Update password
    user.password = newPassword
    user.resetPasswordToken = undefined
    user.resetPasswordExpiry = undefined
    await user.save()
    
    res.json({ message: 'Password reset successfully' })
    
  } catch (error) {
    res.status(500).json({ message: 'Error resetting password' })
  }
}
```

### Restaurant Dashboard Features

#### Restaurant Analytics
**File Chain**: `routes/admin.routes.js` → `controllers/admin.controller.js`

```javascript
// Get restaurant analytics
const getRestaurantAnalytics = async (req, res) => {
  try {
    const restaurantId = req.user.restaurant
    const { period = '7d' } = req.query
    
    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    
    switch (period) {
      case '24h':
        startDate.setHours(startDate.getHours() - 24)
        break
      case '7d':
        startDate.setDate(startDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(startDate.getDate() - 30)
        break
      case '90d':
        startDate.setDate(startDate.getDate() - 90)
        break
    }
    
    // Aggregate analytics data
    const analytics = await Promise.all([
      // Total orders and revenue
      Order.aggregate([
        {
          $match: {
            restaurant: mongoose.Types.ObjectId(restaurantId),
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: '$totalAmount' },
            avgOrderValue: { $avg: '$totalAmount' }
          }
        }
      ]),
      
      // Orders by status
      Order.aggregate([
        {
          $match: {
            restaurant: mongoose.Types.ObjectId(restaurantId),
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Daily order trends
      Order.aggregate([
        {
          $match: {
            restaurant: mongoose.Types.ObjectId(restaurantId),
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            orders: { $sum: 1 },
            revenue: { $sum: '$totalAmount' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ]),
      
      // Popular menu items
      Order.aggregate([
        {
          $match: {
            restaurant: mongoose.Types.ObjectId(restaurantId),
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.name',
            totalQuantity: { $sum: '$items.quantity' },
            totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
          }
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 10 }
      ])
    ])
    
    res.json({
      period,
      summary: analytics[0][0] || { totalOrders: 0, totalRevenue: 0, avgOrderValue: 0 },
      ordersByStatus: analytics[1],
      dailyTrends: analytics[2],
      popularItems: analytics[3]
    })
    
  } catch (error) {
    console.error('Analytics error:', error)
    res.status(500).json({ message: 'Error fetching analytics' })
  }
}
```

### Notification System

#### Real-time Notifications
```javascript
// Notification types
const NOTIFICATION_TYPES = {
  NEW_ORDER: 'new_order',
  ORDER_STATUS_UPDATE: 'order_status_update',
  RESTAURANT_APPROVED: 'restaurant_approved',
  RESTAURANT_REJECTED: 'restaurant_rejected',
  PAYMENT_SUCCESS: 'payment_success',
  PAYMENT_FAILED: 'payment_failed'
}

// Send notification helper
const sendNotification = (io, userId, notification) => {
  io.to(`user_${userId}`).emit('notification', {
    id: generateNotificationId(),
    type: notification.type,
    title: notification.title,
    message: notification.message,
    data: notification.data,
    timestamp: new Date(),
    read: false
  })
}

// Usage in order creation
const createOrder = async (req, res) => {
  // ... order creation logic ...
  
  // Notify restaurant admin
  const restaurant = await Restaurant.findById(restaurantId).populate('owner')
  const io = req.app.get('socketio')
  
  sendNotification(io, restaurant.owner._id, {
    type: NOTIFICATION_TYPES.NEW_ORDER,
    title: 'New Order Received',
    message: `New order from ${req.user.name} for ₹${totalAmount}`,
    data: { orderId: savedOrder._id, customerName: req.user.name }
  })
  
  // Notify customer
  sendNotification(io, req.user._id, {
    type: NOTIFICATION_TYPES.PAYMENT_SUCCESS,
    title: 'Order Confirmed',
    message: `Your order from ${restaurant.name} has been confirmed`,
    data: { orderId: savedOrder._id, restaurantName: restaurant.name }
  })
}
```

### Advanced Search Features

#### Search with Filters and Sorting
```javascript
// Advanced search with multiple filters
const advancedSearch = async (req, res) => {
  try {
    const {
      q,              // Search query
      location,       // City/area
      cuisine,        // Cuisine type
      minRating,      // Minimum rating
      maxRating,      // Maximum rating
      minPrice,       // Minimum price range
      maxPrice,       // Maximum price range
      sortBy,         // Sort field
      sortOrder,      // Sort direction
      page = 1,       // Page number
      limit = 10,     // Results per page
      isVeg,          // Vegetarian filter
      isOpen          // Open restaurants only
    } = req.query
    
    // Build aggregation pipeline
    const pipeline = []
    
    // Match stage - basic filters
    const matchStage = {
      status: 'approved'
    }
    
    if (isOpen === 'true') {
      matchStage.isOpen = true
    }
    
    if (minRating) {
      matchStage.averageRating = { $gte: parseFloat(minRating) }
    }
    
    if (maxRating) {
      matchStage.averageRating = { 
        ...matchStage.averageRating, 
        $lte: parseFloat(maxRating) 
      }
    }
    
    pipeline.push({ $match: matchStage })
    
    // Text search stage
    if (q) {
      pipeline.push({
        $match: {
          $or: [
            { name: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } },
            { cuisine: { $in: [new RegExp(q, 'i')] } },
            { 'menuItems.name': { $regex: q, $options: 'i' } }
          ]
        }
      })
    }
    
    // Location filter
    if (location) {
      pipeline.push({
        $match: {
          $or: [
            { 'address.city': { $regex: location, $options: 'i' } },
            { 'address.state': { $regex: location, $options: 'i' } }
          ]
        }
      })
    }
    
    // Cuisine filter
    if (cuisine) {
      pipeline.push({
        $match: {
          cuisine: { $in: [new RegExp(cuisine, 'i')] }
        }
      })
    }
    
    // Price range filter (based on menu items)
    if (minPrice || maxPrice) {
      pipeline.push({
        $match: {
          'menuItems': {
            $elemMatch: {
              price: {
                ...(minPrice && { $gte: parseFloat(minPrice) }),
                ...(maxPrice && { $lte: parseFloat(maxPrice) })
              }
            }
          }
        }
      })
    }
    
    // Add calculated fields
    pipeline.push({
      $addFields: {
        minPrice: { $min: '$menuItems.price' },
        maxPrice: { $max: '$menuItems.price' },
        totalMenuItems: { $size: '$menuItems' }
      }
    })
    
    // Sort stage
    const sortStage = {}
    switch (sortBy) {
      case 'rating':
        sortStage.averageRating = sortOrder === 'asc' ? 1 : -1
        break
      case 'price':
        sortStage.minPrice = sortOrder === 'asc' ? 1 : -1
        break
      case 'name':
        sortStage.name = sortOrder === 'asc' ? 1 : -1
        break
      default:
        sortStage.averageRating = -1
        sortStage.name = 1
    }
    
    pipeline.push({ $sort: sortStage })
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit)
    pipeline.push({ $skip: skip })
    pipeline.push({ $limit: parseInt(limit) })
    
    // Execute search
    const restaurants = await Restaurant.aggregate(pipeline)
    
    // Get total count for pagination
    const countPipeline = [...pipeline.slice(0, -2)] // Remove skip and limit
    countPipeline.push({ $count: 'total' })
    const countResult = await Restaurant.aggregate(countPipeline)
    const totalCount = countResult[0]?.total || 0
    
    res.json({
      restaurants,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        hasNext: parseInt(page) < Math.ceil(totalCount / parseInt(limit)),
        hasPrev: parseInt(page) > 1
      },
      filters: {
        q, location, cuisine, minRating, maxRating, 
        minPrice, maxPrice, sortBy, sortOrder
      }
    })
    
  } catch (error) {
    console.error('Advanced search error:', error)
    res.status(500).json({ message: 'Error performing search' })
  }
}
```

### Delivery Address Management

#### Multiple Address Support
```javascript
// User model with addresses
const userSchema = new mongoose.Schema({
  // ... existing fields ...
  addresses: [{
    label: { type: String, required: true }, // 'Home', 'Office', etc.
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    landmark: { type: String },
    isDefault: { type: Boolean, default: false },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  }]
})

// Add new address
const addAddress = async (req, res) => {
  try {
    const { label, street, city, state, pincode, landmark, isDefault } = req.body
    
    const user = await User.findById(req.user._id)
    
    // If this is set as default, unset other defaults
    if (isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false)
    }
    
    // If this is the first address, make it default
    const makeDefault = isDefault || user.addresses.length === 0
    
    user.addresses.push({
      label,
      street,
      city,
      state,
      pincode,
      landmark,
      isDefault: makeDefault
    })
    
    await user.save()
    
    res.status(201).json({
      message: 'Address added successfully',
      addresses: user.addresses
    })
    
  } catch (error) {
    res.status(500).json({ message: 'Error adding address' })
  }
}

// Get user addresses
const getUserAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('addresses')
    res.json(user.addresses)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching addresses' })
  }
}
```

### Coupon & Discount System

#### Coupon Model and Application
```javascript
// Coupon model
const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  description: { type: String, required: true },
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  discountValue: { type: Number, required: true },
  minOrderAmount: { type: Number, default: 0 },
  maxDiscountAmount: { type: Number }, // For percentage discounts
  validFrom: { type: Date, required: true },
  validUntil: { type: Date, required: true },
  usageLimit: { type: Number, default: null }, // null = unlimited
  usedCount: { type: Number, default: 0 },
  applicableRestaurants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' }],
  isActive: { type: Boolean, default: true },
  userUsageLimit: { type: Number, default: 1 }, // Per user limit
  usedBy: [{ 
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    usedAt: { type: Date, default: Date.now },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }
  }]
}, { timestamps: true })

// Apply coupon
const applyCoupon = async (req, res) => {
  try {
    const { couponCode, orderAmount, restaurantId } = req.body
    
    // Find coupon
    const coupon = await Coupon.findOne({ 
      code: couponCode.toUpperCase(),
      isActive: true,
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() }
    })
    
    if (!coupon) {
      return res.status(404).json({ message: 'Invalid or expired coupon' })
    }
    
    // Check usage limits
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: 'Coupon usage limit exceeded' })
    }
    
    // Check user usage limit
    const userUsage = coupon.usedBy.filter(usage => 
      usage.user.toString() === req.user._id.toString()
    ).length
    
    if (userUsage >= coupon.userUsageLimit) {
      return res.status(400).json({ message: 'You have already used this coupon' })
    }
    
    // Check minimum order amount
    if (orderAmount < coupon.minOrderAmount) {
      return res.status(400).json({ 
        message: `Minimum order amount ₹${coupon.minOrderAmount} required` 
      })
    }
    
    // Check restaurant applicability
    if (coupon.applicableRestaurants.length > 0 && 
        !coupon.applicableRestaurants.includes(restaurantId)) {
      return res.status(400).json({ message: 'Coupon not applicable for this restaurant' })
    }
    
    // Calculate discount
    let discountAmount = 0
    if (coupon.discountType === 'percentage') {
      discountAmount = (orderAmount * coupon.discountValue) / 100
      if (coupon.maxDiscountAmount) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount)
      }
    } else {
      discountAmount = coupon.discountValue
    }
    
    // Ensure discount doesn't exceed order amount
    discountAmount = Math.min(discountAmount, orderAmount)
    
    res.json({
      valid: true,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discountAmount: Math.round(discountAmount * 100) / 100,
        finalAmount: Math.round((orderAmount - discountAmount) * 100) / 100
      }
    })
    
  } catch (error) {
    res.status(500).json({ message: 'Error applying coupon' })
  }
}
```

This comprehensive guide now covers the complete user journey from cart management to order tracking, plus all the additional features like rating system, profile management, advanced search, notifications, analytics, address management, and coupon system. Each section includes detailed code examples showing the exact file chains and implementation patterns used in your Eatio backend system.
---

## SuperAdmin Flow & Platform Management

### SuperAdmin Role Overview
The SuperAdmin is the highest level of access in the Eatio platform, responsible for:
- **Restaurant Approval Process** - Review and approve/reject restaurant applications
- **Platform Oversight** - Monitor system-wide statistics and performance
- **User Management** - View all users and their activities
- **System Administration** - Manage platform settings and configurations

### SuperAdmin Creation & Setup

#### Initial SuperAdmin Setup
**File**: `eatio-backend/server/scripts/create-superadmin.js`

```javascript
// Create SuperAdmin script - Run once during deployment
const createSuperAdmin = async () => {
  try {
    // Get credentials from environment variables
    const superAdminData = {
      name: process.env.SUPERADMIN_NAME || 'Super Admin',
      email: process.env.SUPERADMIN_EMAIL,
      phone: process.env.SUPERADMIN_PHONE,
      password: process.env.SUPERADMIN_PASSWORD,
      role: 'superadmin'
    }
    
    // Validate required environment variables
    if (!superAdminData.email || !superAdminData.phone || !superAdminData.password) {
      console.error('❌ Missing required environment variables')
      process.exit(1)
    }
    
    // Check if superadmin already exists
    const existingSuperAdmin = await User.findOne({ 
      $or: [
        { email: superAdminData.email },
        { role: 'superadmin' }
      ]
    })
    
    if (existingSuperAdmin) {
      console.log('👑 Super Admin user already exists')
      return existingSuperAdmin
    }
    
    // Create new superadmin user
    const superAdmin = new User(superAdminData)
    await superAdmin.save()
    
    console.log('✅ Super Admin user created successfully!')
    return superAdmin
    
  } catch (error) {
    console.error('❌ Error creating superadmin:', error)
    throw error
  }
}

// Usage: npm run setup-superadmin
```

#### Environment Variables for SuperAdmin
```bash
# .env file
SUPERADMIN_NAME=Super Admin
SUPERADMIN_EMAIL=superadmin@yourdomain.com
SUPERADMIN_PHONE=1234567890
SUPERADMIN_PASSWORD=YourSecurePassword123
```

### SuperAdmin Authentication Flow

#### SuperAdmin Login Process
**File Chain**: `routes/auth.routes.js` → `controllers/auth.controller.js` → `middlewares/auth.middleware.js`

```javascript
// SuperAdmin login validation
const loginUser = async (req, res) => {
  const { email, password } = req.body
  
  const user = await User.findOne({ email })
  
  if (user && (await user.matchPassword(password))) {
    // Special handling for superadmin role
    if (user.role === 'superadmin') {
      console.log('👑 SuperAdmin login detected')
      
      // Generate superadmin-specific JWT token
      generateToken(res, user._id, 'superadmin')
      
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        message: 'SuperAdmin login successful',
        dashboardUrl: '/super-admin/dashboard'
      })
    } else {
      // Regular user login flow
      generateToken(res, user._id, user.role)
      res.json({ /* regular user response */ })
    }
  } else {
    res.status(401).json({ message: 'Invalid credentials' })
  }
}
```

#### SuperAdmin Authorization Middleware
```javascript
// File: middlewares/auth.middleware.js
const isSuperAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'superadmin') {
    console.log('✅ SuperAdmin access granted')
    next()
  } else {
    console.log('❌ SuperAdmin access denied - insufficient privileges')
    res.status(403).json({ 
      message: 'Access denied. Super admin role required.',
      requiredRole: 'superadmin',
      currentRole: req.user?.role || 'none'
    })
  }
}
```

### SuperAdmin Dashboard Features

#### Dashboard Overview
**File**: `frontend/src/pages/superadmin/SuperAdminDashboard.jsx`

```javascript
const SuperAdminDashboard = () => {
  // Data fetching hooks
  const { data: pendingRestaurants, isLoading: pendingLoading } = usePendingRestaurants()
  const { data: systemStats, isLoading: statsLoading } = useSystemStats()
  const { data: allRestaurants, isLoading: restaurantsLoading } = useAllRestaurants()
  const { data: allUsers, isLoading: usersLoading } = useAllUsers()
  const { data: allOrders, isLoading: ordersLoading } = useAllOrders()
  
  // Real-time updates
  useSuperAdminDashboardUpdates()
  
  return (
    <Container maxWidth="xl">
      {/* Stats Cards Row */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}>
            <CardContent>
              <Typography variant="h2" sx={{ color: 'white', fontWeight: 800 }}>
                {systemStats?.totalRestaurants || 0}
              </Typography>
              <Typography variant="body2" sx={{ color: 'white', opacity: 0.9 }}>
                Total Restaurants
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: systemStats?.pendingApprovals > 0 
              ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
              : 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
          }}>
            <CardContent>
              <Typography variant="h2" sx={{ color: 'white', fontWeight: 800 }}>
                {systemStats?.pendingApprovals || 0}
              </Typography>
              <Typography variant="body2" sx={{ color: 'white', opacity: 0.9 }}>
                Pending Approvals
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Additional stat cards... */}
      </Grid>
      
      {/* Pending Approvals Table */}
      <Card>
        <CardContent>
          <Typography variant="h6">Pending Restaurant Approvals</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Restaurant</TableCell>
                  <TableCell>Owner Details</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Documents</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingRestaurants?.map(restaurant => (
                  <TableRow key={restaurant._id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar src={restaurant.documents?.restaurantPhoto}>
                          🍽️
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {restaurant.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {restaurant.cuisine?.join(', ')}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{restaurant.owner?.name}</Typography>
                      <Typography variant="caption">{restaurant.owner?.email}</Typography>
                    </TableCell>
                    <TableCell>
                      {restaurant.address?.city}, {restaurant.address?.state}
                    </TableCell>
                    <TableCell>
                      {restaurant.documents?.fssaiLicense && (
                        <Chip label="FSSAI License" size="small" color="success" />
                      )}
                      {restaurant.documents?.restaurantPhoto && (
                        <Chip label="Restaurant Photo" size="small" color="info" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        onClick={() => handleReviewRestaurant(restaurant)}
                      >
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Container>
  )
}
```

### Restaurant Approval Process

#### Complete Approval Workflow
**File Chain**: `routes/admin.routes.js` → `controllers/admin.controller.js`

#### Step 1: Get Pending Restaurants
```javascript
// Route: GET /api/admin/restaurants/pending
// Middleware: isAuthenticated, isSuperAdmin
const getPendingRestaurants = async (req, res) => {
  try {
    const pendingRestaurants = await Restaurant.find({ 
      status: { $in: ['pending', 'pending_approval'] } 
    })
    .populate('owner', 'name email phone')
    .sort({ createdAt: -1 })
    
    console.log(`📋 Found ${pendingRestaurants.length} pending restaurants`)
    
    res.json(pendingRestaurants)
  } catch (error) {
    console.error('❌ Error fetching pending restaurants:', error)
    res.status(500).json({ message: 'Error fetching pending restaurants' })
  }
}
```

#### Step 2: Review Restaurant Application
```javascript
// Frontend review dialog
const handleReviewRestaurant = (restaurant) => {
  setSelectedRestaurant(restaurant)
  setStatus('')
  setRemarks('')
  setReviewDialog(true)
}

// Review dialog content
<Dialog open={reviewDialog} maxWidth="md" fullWidth>
  <DialogTitle>
    Review Restaurant Application - {selectedRestaurant?.name}
  </DialogTitle>
  <DialogContent>
    {/* Restaurant Details */}
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <Typography variant="subtitle2">Restaurant Name</Typography>
        <Typography variant="body1">{selectedRestaurant?.name}</Typography>
        
        <Typography variant="subtitle2">Owner Details</Typography>
        <Typography variant="body2">{selectedRestaurant?.owner?.name}</Typography>
        <Typography variant="body2">{selectedRestaurant?.owner?.email}</Typography>
        <Typography variant="body2">{selectedRestaurant?.owner?.phone}</Typography>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Typography variant="subtitle2">Address</Typography>
        <Typography variant="body2">
          {selectedRestaurant?.address?.street}<br />
          {selectedRestaurant?.address?.city} - {selectedRestaurant?.address?.pincode}
        </Typography>
        
        <Typography variant="subtitle2">Cuisine Types</Typography>
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {selectedRestaurant?.cuisine?.map(cuisine => (
            <Chip key={cuisine} label={cuisine} size="small" />
          ))}
        </Box>
      </Grid>
    </Grid>
    
    {/* Documents Section */}
    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
      Documents
    </Typography>
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <Typography variant="body2">
          FSSAI License: {selectedRestaurant?.fssaiLicenseNumber}
        </Typography>
        {selectedRestaurant?.documents?.fssaiLicense && (
          <Button
            size="small"
            startIcon={<DocumentArrowDownIcon />}
            onClick={() => downloadDocument(
              selectedRestaurant.documents.fssaiLicense,
              'fssai-license.pdf'
            )}
          >
            Download FSSAI License
          </Button>
        )}
      </Grid>
      
      {/* Additional document downloads... */}
    </Grid>
    
    {/* Review Form */}
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>Decision</InputLabel>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <MenuItem value="approved">Approve</MenuItem>
            <MenuItem value="rejected">Reject</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Remarks (Optional)"
          multiline
          rows={3}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Add any comments or feedback..."
        />
      </Grid>
    </Grid>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setReviewDialog(false)}>Cancel</Button>
    <Button
      variant="contained"
      onClick={handleStatusUpdate}
      color={status === 'approved' ? 'success' : 'error'}
    >
      {status === 'approved' ? 'Approve' : 'Reject'} Restaurant
    </Button>
  </DialogActions>
</Dialog>
```

#### Step 3: Update Restaurant Status
```javascript
// Route: PUT /api/admin/restaurants/:id/status
// Middleware: isAuthenticated, isSuperAdmin
const updateRestaurantStatus = async (req, res) => {
  try {
    const { status, remarks } = req.body
    const restaurantId = req.params.id
    
    // Validate status
    const validStatuses = ['approved', 'rejected', 'pending']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' })
    }
    
    console.log(`🔄 Updating restaurant ${restaurantId} status to: ${status}`)
    
    // Update restaurant status
    const updateData = { 
      status,
      ...(remarks && { rejectionReason: remarks }),
      reviewedAt: new Date(),
      reviewedBy: req.user._id
    }
    
    const restaurant = await Restaurant.findByIdAndUpdate(
      restaurantId,
      updateData,
      { new: true }
    ).populate('owner', 'name email phone')
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' })
    }
    
    console.log(`✅ Restaurant ${restaurant.name} ${status} successfully`)
    
    // Send notification email to restaurant owner
    await sendRestaurantStatusEmail(restaurant, status, remarks)
    
    // Emit real-time notification
    const io = req.app.get('socketio')
    
    // Notify restaurant owner
    io.to(`user_${restaurant.owner._id}`).emit('restaurant_status_updated', {
      restaurantId: restaurant._id,
      restaurantName: restaurant.name,
      status: status,
      message: status === 'approved' 
        ? 'Congratulations! Your restaurant has been approved.'
        : 'Your restaurant application needs attention.',
      remarks: remarks,
      timestamp: new Date()
    })
    
    // Notify all superadmins
    io.emit('restaurant_reviewed', {
      restaurantId: restaurant._id,
      restaurantName: restaurant.name,
      status: status,
      reviewedBy: req.user.name,
      timestamp: new Date()
    })
    
    res.json({
      message: `Restaurant ${status} successfully`,
      restaurant: {
        _id: restaurant._id,
        name: restaurant.name,
        status: restaurant.status,
        owner: restaurant.owner
      }
    })
    
  } catch (error) {
    console.error('❌ Error updating restaurant status:', error)
    res.status(500).json({ message: 'Error updating restaurant status' })
  }
}
```

#### Step 4: Email Notification System
```javascript
// Send status update email to restaurant owner
const sendRestaurantStatusEmail = async (restaurant, status, remarks) => {
  try {
    const emailData = {
      to: restaurant.owner.email,
      subject: `Restaurant Application ${status === 'approved' ? 'Approved' : 'Update'} - ${restaurant.name}`,
      template: status === 'approved' ? 'restaurant-approved' : 'restaurant-rejected',
      data: {
        restaurantName: restaurant.name,
        ownerName: restaurant.owner.name,
        status: status,
        remarks: remarks,
        loginUrl: `${process.env.CLIENT_URL}/login`,
        supportEmail: 'support@eatio.com'
      }
    }
    
    // Send email using your email service
    // await emailService.send(emailData)
    
    console.log(`📧 Status update email sent to ${restaurant.owner.email}`)
    
  } catch (error) {
    console.error('❌ Error sending status email:', error)
    // Don't fail the status update if email fails
  }
}
```

### System Statistics & Analytics

#### System Stats API
```javascript
// Route: GET /api/admin/stats
// Middleware: isAuthenticated, isSuperAdmin
const getSystemStats = async (req, res) => {
  try {
    console.log('📊 Generating system statistics...')
    
    // Parallel execution of all stat queries
    const [
      restaurantStats,
      userStats,
      orderStats,
      revenueStats,
      recentActivity
    ] = await Promise.all([
      // Restaurant statistics
      Restaurant.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      
      // User statistics
      User.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Order statistics
      Order.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalRevenue: { $sum: '$totalAmount' }
          }
        }
      ]),
      
      // Total revenue
      Order.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalAmount' },
            totalOrders: { $sum: 1 },
            avgOrderValue: { $avg: '$totalAmount' }
          }
        }
      ]),
      
      // Recent activity (last 7 days)
      Promise.all([
        Order.countDocuments({
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }),
        Restaurant.countDocuments({
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }),
        User.countDocuments({
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        })
      ])
    ])
    
    // Process restaurant stats
    const restaurantStatsMap = {}
    restaurantStats.forEach(stat => {
      restaurantStatsMap[stat._id] = stat.count
    })
    
    // Process user stats
    const userStatsMap = {}
    userStats.forEach(stat => {
      userStatsMap[stat._id] = stat.count
    })
    
    // Process order stats
    const orderStatsMap = {}
    let totalOrderRevenue = 0
    orderStats.forEach(stat => {
      orderStatsMap[stat._id] = stat.count
      totalOrderRevenue += stat.totalRevenue || 0
    })
    
    const stats = {
      // Restaurant metrics
      totalRestaurants: Object.values(restaurantStatsMap).reduce((a, b) => a + b, 0),
      approvedRestaurants: restaurantStatsMap.approved || 0,
      pendingApprovals: (restaurantStatsMap.pending || 0) + (restaurantStatsMap.pending_approval || 0),
      rejectedRestaurants: restaurantStatsMap.rejected || 0,
      activeRestaurants: restaurantStatsMap.approved || 0,
      
      // User metrics
      totalUsers: Object.values(userStatsMap).reduce((a, b) => a + b, 0),
      customers: userStatsMap.customer || 0,
      restaurantAdmins: userStatsMap.admin || 0,
      superAdmins: userStatsMap.superadmin || 0,
      
      // Order metrics
      totalOrders: Object.values(orderStatsMap).reduce((a, b) => a + b, 0),
      completedOrders: orderStatsMap.Delivered || 0,
      pendingOrders: (orderStatsMap.Pending || 0) + (orderStatsMap.Confirmed || 0) + (orderStatsMap.Preparing || 0),
      cancelledOrders: orderStatsMap.Cancelled || 0,
      
      // Revenue metrics
      totalRevenue: revenueStats[0]?.totalRevenue || 0,
      avgOrderValue: revenueStats[0]?.avgOrderValue || 0,
      
      // Recent activity (last 7 days)
      recentActivity: {
        orders: recentActivity[0],
        registrations: recentActivity[1],
        newUsers: recentActivity[2]
      },
      
      // Today's activity
      todayOrders: 0, // Would need separate query for today
      
      // Generated timestamp
      generatedAt: new Date()
    }
    
    console.log('✅ System statistics generated successfully')
    res.json(stats)
    
  } catch (error) {
    console.error('❌ Error generating system stats:', error)
    res.status(500).json({ message: 'Error fetching system statistics' })
  }
}
```

### SuperAdmin Real-time Updates

#### Real-time Dashboard Updates
```javascript
// Frontend hook for real-time updates
const useSuperAdminDashboardUpdates = () => {
  const queryClient = useQueryClient()
  
  useEffect(() => {
    const socket = io(process.env.REACT_APP_API_URL, {
      withCredentials: true
    })
    
    // Listen for new restaurant applications
    socket.on('new_restaurant_application', (data) => {
      console.log('🏪 New restaurant application:', data)
      
      // Update pending restaurants query
      queryClient.invalidateQueries(['pendingRestaurants'])
      queryClient.invalidateQueries(['systemStats'])
      
      // Show notification
      toast.info(`New restaurant application: ${data.restaurantName}`)
    })
    
    // Listen for restaurant status updates
    socket.on('restaurant_reviewed', (data) => {
      console.log('✅ Restaurant reviewed:', data)
      
      // Update all relevant queries
      queryClient.invalidateQueries(['pendingRestaurants'])
      queryClient.invalidateQueries(['allRestaurants'])
      queryClient.invalidateQueries(['systemStats'])
      
      // Show notification
      toast.success(`Restaurant ${data.restaurantName} ${data.status} by ${data.reviewedBy}`)
    })
    
    // Listen for new orders (for stats)
    socket.on('new_order_placed', (data) => {
      console.log('📦 New order placed:', data)
      
      // Update system stats
      queryClient.invalidateQueries(['systemStats'])
      queryClient.invalidateQueries(['allOrders'])
    })
    
    // Listen for new user registrations
    socket.on('new_user_registered', (data) => {
      console.log('👤 New user registered:', data)
      
      // Update user stats
      queryClient.invalidateQueries(['systemStats'])
      queryClient.invalidateQueries(['allUsers'])
    })
    
    return () => {
      socket.disconnect()
    }
  }, [queryClient])
}
```

### SuperAdmin Security Features

#### Access Control & Logging
```javascript
// Enhanced SuperAdmin middleware with logging
const isSuperAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'superadmin') {
    // Log SuperAdmin actions
    console.log(`👑 SuperAdmin Action: ${req.method} ${req.path}`, {
      userId: req.user._id,
      userEmail: req.user.email,
      timestamp: new Date(),
      ip: req.ip,
      userAgent: req.get('User-Agent')
    })
    
    // Optional: Store in audit log
    // await AuditLog.create({
    //   userId: req.user._id,
    //   action: `${req.method} ${req.path}`,
    //   ip: req.ip,
    //   userAgent: req.get('User-Agent'),
    //   timestamp: new Date()
    // })
    
    next()
  } else {
    console.log('❌ SuperAdmin access denied:', {
      userId: req.user?._id,
      userRole: req.user?.role,
      attemptedPath: req.path,
      ip: req.ip
    })
    
    res.status(403).json({ 
      message: 'Access denied. Super admin role required.',
      requiredRole: 'superadmin',
      currentRole: req.user?.role || 'none'
    })
  }
}
```

#### SuperAdmin Route Protection
```javascript
// All SuperAdmin routes with proper protection
// File: routes/admin.routes.js

// SuperAdmin-only routes
router.get('/restaurants/pending', isAuthenticated, isSuperAdmin, getPendingRestaurants)
router.put('/restaurants/:id/status', isAuthenticated, isSuperAdmin, updateRestaurantStatus)
router.get('/stats', isAuthenticated, isSuperAdmin, getSystemStats)
router.get('/restaurants', isAuthenticated, isSuperAdmin, getAllRestaurants)
router.get('/users', isAuthenticated, isSuperAdmin, getAllUsers)
router.get('/orders/all', isAuthenticated, isSuperAdmin, getAllOrders)

// Additional SuperAdmin features
router.get('/audit-logs', isAuthenticated, isSuperAdmin, getAuditLogs)
router.post('/system/maintenance', isAuthenticated, isSuperAdmin, toggleMaintenanceMode)
router.get('/system/health', isAuthenticated, isSuperAdmin, getSystemHealth)
```

### SuperAdmin Complete Workflow Summary

1. **Initial Setup**
   - Run `npm run setup-superadmin` script
   - SuperAdmin user created with credentials from .env
   - SuperAdmin can login with special privileges

2. **Dashboard Access**
   - SuperAdmin logs in with email/password
   - Redirected to SuperAdmin dashboard
   - Real-time updates via Socket.IO

3. **Restaurant Approval Process**
   - View pending restaurant applications
   - Review restaurant details and documents
   - Approve or reject with remarks
   - Email notifications sent to restaurant owners
   - Real-time updates to all connected clients

4. **System Monitoring**
   - View platform-wide statistics
   - Monitor user activity and registrations
   - Track order volumes and revenue
   - Access audit logs and system health

5. **Platform Management**
   - Manage all users and restaurants
   - View all orders across the platform
   - Control system settings and maintenance mode
   - Monitor platform performance and security

The SuperAdmin role provides complete oversight and control over the Eatio platform, ensuring quality restaurants are approved and the system operates smoothly for all users.