// server/server.js

// --- DOTENV CONFIG MUST BE THE VERY FIRST THING ---
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require("socket.io");
const cookieParser = require('cookie-parser');
const connectDB = require("./config/db");
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// --- Import Route Files ---
const authRoutes = require('./routes/auth.routes');
const restaurantRoutes = require('./routes/restaurant.routes');
const userRoutes = require('./routes/user.routes');
const searchRoutes = require('./routes/search.routes');
const orderRoutes = require('./routes/order.routes');
const uploadRoutes = require('./routes/upload.routes');
const paymentRoutes = require('./routes/payment.routes');
const adminRoutes = require('./routes/admin.routes');
const menuImageRoutes = require('./routes/menuImage.routes');
const restaurantImageRoutes = require('./routes/restaurantImage.routes');
const profileImageRoutes = require('./routes/profileImage.routes');
// NEW ADDITIVE ROUTE - RATING SYSTEM
const reviewRoutes = require('./routes/review.routes');

const app = express();
const server = http.createServer(app);

// Note: Static file serving removed - all images now served via Cloudinary CDN

// --- Global Middleware ---
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.ADMIN_URL,
  'http://localhost:5174', // New Eatio frontend
  'http://localhost:5173', // Admin panel
  'http://localhost:3000'  // Fallback for development
];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// --- THIS IS THE FIX ---
// Relax the rate limiter for a better development experience.
const limiter = rateLimit({
  windowMs: process.env.NODE_ENV === 'development' ? 1 * 60 * 1000 : 15 * 60 * 1000, // 1 minute in dev, 15 in prod
  max: process.env.NODE_ENV === 'development' ? 500 : 100, // 500 requests in dev, 100 in prod
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after a few minutes.',
});
app.use(limiter);
// --- END OF FIX ---


// --- Health Check Route ---
app.get('/', (req, res) => {
  res.json({
    message: 'Eatio Server is running!',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({
    message: 'Eatio Server is running!',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Static file serving moved to top of middleware stack

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/users', userRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/menu-images', menuImageRoutes);
app.use('/api/restaurant-images', restaurantImageRoutes);
app.use('/api/profile-images', profileImageRoutes);
// NEW ADDITIVE ROUTE - RATING SYSTEM
app.use('/api/reviews', reviewRoutes);
// Note: Static file routes removed - all images now served via Cloudinary CDN

// --- Centralized Error Handler ---
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// --- SOCKET.IO SETUP ---
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log('✅ A user connected via WebSocket');
  socket.on('join_order_room', (orderId) => {
    socket.join(orderId);
    console.log(`User joined room for order: ${orderId}`);
  });
  socket.on('disconnect', () => {
    console.log('❌ User disconnected');
  });
});
app.set('socketio', io);
// --- END OF SOCKET.IO SETUP ---

// --- Server Initialization ---
const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`✅ Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect MongoDB", err);
    process.exit(1);
  });