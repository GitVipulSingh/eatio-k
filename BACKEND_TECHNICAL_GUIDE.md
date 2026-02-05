# Eatio Backend Technical Guide

## Table of Contents
1. [System Architecture Overview](#system-architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Database Design](#database-design)
5. [Authentication & Authorization](#authentication--authorization)
6. [API Endpoints Flow](#api-endpoints-flow)
7. [Real-time Features](#real-time-features)
8. [Security Implementation](#security-implementation)
9. [JavaScript/Node.js/Express Syntax Guide](#javascriptnodejsexpress-syntax-guide)
10. [Common Patterns & Best Practices](#common-patterns--best-practices)

---

## System Architecture Overview

### High-Level Architecture
```
Frontend (React) ↔ Backend API (Express.js) ↔ Database (MongoDB)
                        ↕
                  Socket.IO (Real-time)
                        ↕
                External Services (Cloudinary, Razorpay, Twilio)
```

### Request Flow
1. **Client Request** → Frontend sends HTTP request
2. **CORS & Security** → Request passes through security middleware
3. **Authentication** → JWT token validation
4. **Route Matching** → Express router matches endpoint
5. **Controller Logic** → Business logic execution
6. **Database Operation** → MongoDB query/update 
7. **Response** → JSON response sent back

---

## Technology Stack

### Core Technologies
- **Runtime**: Node.js (≥18.0.0)
- **Framework**: Express.js 5.1.0
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.IO

### Key Dependencies
```javascript
// Security & Middleware
helmet: "^8.1.0"           // Security headers
cors: "^2.8.5"             // Cross-origin requests
express-rate-limit: "^8.0.1" // Rate limiting

// Authentication & Encryption
jsonwebtoken: "^9.0.2"     // JWT tokens
bcryptjs: "^3.0.2"         // Password hashing

// File Upload & Storage
multer: "^2.0.2"           // File upload handling
cloudinary: "^1.41.3"      // Image storage service

// Payment & Communication
razorpay: "^2.9.6"         // Payment gateway
twilio: "^5.8.0"           // SMS service
```

---

## Project Structure

```
eatio-backend/server/
├── config/
│   ├── db.js              # Database connection
│   └── cloudinary.js      # Image upload config
├── controllers/           # Business logic
│   ├── auth.controller.js
│   ├── order.controller.js
│   ├── payment.controller.js
│   └── ...
├── middlewares/           # Custom middleware
│   └── auth.middleware.js
├── models/               # Database schemas
│   ├── user.model.js
│   ├── restaurant.model.js
│   └── order.model.js
├── routes/               # API endpoints
│   ├── auth.routes.js
│   ├── order.routes.js
│   └── ...
├── utils/                # Helper functions
│   └── generateToken.js
└── server.js             # Main server file
```

---

## Database Design

### User Schema
```javascript
// User roles: customer, admin, superadmin
{
  name: String,
  email: String (unique),
  phone: String (unique),
  password: String (hashed),
  role: String (enum),
  restaurant: ObjectId (for admin users),
  orders: [ObjectId],
  timestamps: true
}
```

### Restaurant Schema
```javascript
{
  name: String,
  description: String,
  address: {
    street, city, state, pincode,
    location: { type: "Point", coordinates: [lng, lat] }
  },
  cuisine: [String],
  owner: ObjectId,
  menuItems: [{
    name, description, price, category, image, isAvailable
  }],
  averageRating: Number,
  status: String (pending/approved/rejected),
  documents: { fssaiLicense, restaurantPhoto, ... }
}
```

### Order Schema
```javascript
{
  user: ObjectId,
  restaurant: ObjectId,
  items: [{ name, price, quantity }],
  totalAmount: Number,
  status: String (Pending/Confirmed/Preparing/...),
  deliveryAddress: { street, city, pincode },
  paymentDetails: { paymentId, orderId, signature, status }
}
```

---

## Authentication & Authorization

### JWT Token System
```javascript
// Role-based cookies
jwt_customer    // For customer users
jwt_admin       // For restaurant admins
jwt_superadmin  // For super admins
```

### Authentication Flow
1. **Login** → Validate credentials → Generate JWT → Set role-based cookie
2. **Request** → Extract cookie → Verify JWT → Attach user to req.user
3. **Authorization** → Check user role → Allow/deny access

### Middleware Chain
```javascript
// Authentication check
isAuthenticated → verify JWT → attach user

// Role-based authorization
isRestaurantAdmin → check admin role + restaurant approval
isSuperAdmin → check superadmin role
```

---

## API Endpoints Flow

### Authentication Endpoints
```
POST /api/auth/register     # User registration
POST /api/auth/login        # User login
POST /api/auth/logout       # User logout
GET  /api/auth/profile      # Get user profile
```

### Restaurant Endpoints
```
GET    /api/restaurants           # Get all restaurants
GET    /api/restaurants/:id       # Get restaurant details
POST   /api/restaurants           # Create restaurant (admin)
PUT    /api/restaurants/:id       # Update restaurant (admin)
DELETE /api/restaurants/:id       # Delete restaurant (admin)
```

### Order Endpoints
```
GET  /api/orders              # Get user orders
POST /api/orders              # Create new order
PUT  /api/orders/:id/status   # Update order status (admin)
GET  /api/orders/:id          # Get order details
```

### Payment Flow
```
POST /api/payment/create-order    # Create Razorpay order
POST /api/payment/verify          # Verify payment signature
```

---

## Real-time Features

### Socket.IO Implementation
```javascript
// Server-side
io.on('connection', (socket) => {
  socket.on('join_order_room', (orderId) => {
    socket.join(orderId);
  });
});

// Order status updates
io.to(orderId).emit('order_status_updated', { status, orderId });
```

### Real-time Events
- **Order Status Updates**: Notify customers of order progress
- **New Order Notifications**: Alert restaurant admins
- **Connection Management**: Handle client connections/disconnections

---

## Security Implementation

### Security Middleware Stack
```javascript
// 1. Helmet - Security headers
helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } })

// 2. CORS - Cross-origin requests
cors({ origin: allowedOrigins, credentials: true })

// 3. Rate Limiting
rateLimit({ windowMs: 15 * 60 * 1000, max: 100 })

// 4. Body parsing with limits
express.json({ limit: "10mb" })
```

### Password Security
```javascript
// Hashing before save
userSchema.pre('save', async function() {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Password comparison
userSchema.methods.matchPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};
```

---

## JavaScript/Node.js/Express Syntax Guide

### Essential JavaScript Concepts

#### 1. Async/Await Pattern
```javascript
// Promise-based async function
const fetchData = async () => {
  try {
    const result = await database.find();
    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};
```

#### 2. Destructuring Assignment
```javascript
// Object destructuring
const { name, email, phone } = req.body;

// Array destructuring
const [first, second] = array;

// Function parameter destructuring
const createUser = ({ name, email, role = 'customer' }) => {
  // function body
};
```

#### 3. Template Literals
```javascript
// String interpolation
const message = `Hello ${name}, your order ${orderId} is ready!`;

// Multi-line strings
const query = `
  SELECT * FROM users 
  WHERE role = '${role}' 
  AND status = 'active'
`;
```

#### 4. Arrow Functions
```javascript
// Regular function
function add(a, b) { return a + b; }

// Arrow function
const add = (a, b) => a + b;

// Arrow function with block body
const processOrder = (order) => {
  const total = calculateTotal(order);
  return { ...order, total };
};
```

### Node.js Specific Patterns

#### 1. Module System
```javascript
// CommonJS (Node.js default)
const express = require('express');
const { connectDB } = require('./config/db');

// Exporting
module.exports = router;
module.exports = { connectDB, generateToken };

// ES6 Modules (with type: "module" in package.json)
import express from 'express';
export default router;
export { connectDB, generateToken };
```

#### 2. Environment Variables
```javascript
// Loading environment variables
require('dotenv').config();

// Accessing environment variables
const port = process.env.PORT || 5000;
const dbUri = process.env.MONGO_URI;
const jwtSecret = process.env.JWT_SECRET;
```

#### 3. Error Handling
```javascript
// Try-catch with async/await
const controller = async (req, res) => {
  try {
    const data = await Model.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Express async handler wrapper
const asyncHandler = require('express-async-handler');
const controller = asyncHandler(async (req, res) => {
  const data = await Model.find();
  res.json(data);
});
```

### Express.js Patterns

#### 1. Middleware Functions
```javascript
// Basic middleware
const logger = (req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next(); // Call next middleware
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};
```

#### 2. Route Handlers
```javascript
// Basic route
app.get('/api/users', (req, res) => {
  res.json({ message: 'Users endpoint' });
});

// Route with parameters
app.get('/api/users/:id', (req, res) => {
  const { id } = req.params;
  res.json({ userId: id });
});

// Route with query parameters
app.get('/api/search', (req, res) => {
  const { q, limit = 10 } = req.query;
  res.json({ query: q, limit: parseInt(limit) });
});
```

#### 3. Router Module Pattern
```javascript
// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const { login, register } = require('../controllers/auth.controller');

router.post('/login', login);
router.post('/register', register);

module.exports = router;

// server.js
const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);
```

### MongoDB/Mongoose Patterns

#### 1. Schema Definition
```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
```

#### 2. Database Operations
```javascript
// Create
const user = await User.create({ name, email, password });

// Read
const users = await User.find({ role: 'customer' });
const user = await User.findById(id);
const user = await User.findOne({ email });

// Update
const user = await User.findByIdAndUpdate(id, updateData, { new: true });

// Delete
await User.findByIdAndDelete(id);

// Population (joining collections)
const order = await Order.findById(id).populate('user restaurant');
```

#### 3. Middleware Hooks
```javascript
// Pre-save middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Instance methods
userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};
```

---

## Common Patterns & Best Practices

### 1. Controller Pattern
```javascript
// controllers/user.controller.js
const User = require('../models/user.model');
const asyncHandler = require('express-async-handler');

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
});

const createUser = asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  const user = await User.create({ name, email });
  res.status(201).json(user);
});

module.exports = { getUsers, createUser };
```

### 2. Validation Pattern
```javascript
const { body, validationResult } = require('express-validator');

// Validation rules
const validateUser = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
];

// Check validation results
const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
```

### 3. Response Standardization
```javascript
// Success response
const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

// Error response
const sendError = (res, message, statusCode = 500) => {
  res.status(statusCode).json({
    success: false,
    message,
    data: null
  });
};
```

### 4. Configuration Management
```javascript
// config/index.js
module.exports = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Derived configurations
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production'
};
```

### 5. Error Handling Strategy
```javascript
// Custom error class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

// Global error handler
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  
  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: 'error',
      error: err,
      message: err.message,
      stack: err.stack
    });
  } else {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.isOperational ? err.message : 'Something went wrong!'
    });
  }
};
```

---

## Interview Preparation Tips

### Key Technical Concepts to Understand

1. **RESTful API Design**: HTTP methods, status codes, resource naming
2. **Middleware Chain**: How Express processes requests through middleware
3. **Authentication vs Authorization**: JWT tokens, role-based access
4. **Database Relationships**: MongoDB references, population
5. **Async Programming**: Promises, async/await, error handling
6. **Security Best Practices**: Input validation, rate limiting, CORS
7. **Real-time Communication**: WebSockets, Socket.IO events
8. **File Upload Handling**: Multer, Cloudinary integration
9. **Payment Integration**: Razorpay flow, signature verification
10. **Environment Configuration**: Environment variables, deployment

### Common Interview Questions

1. **"Explain the authentication flow in your application"**
2. **"How do you handle file uploads and storage?"**
3. **"What security measures have you implemented?"**
4. **"How does real-time order tracking work?"**
5. **"Explain your database schema design decisions"**
6. **"How do you handle errors in async operations?"**
7. **"What is middleware and how do you use it?"**
8. **"How do you manage different user roles?"**

Remember: Focus on understanding the concepts and flow rather than memorizing code. Be able to explain WHY you chose certain patterns and HOW they solve specific problems.