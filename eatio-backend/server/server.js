// server/server.js

/* =======================
   ENV CONFIGURATION
======================= */
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

/* =======================
   IMPORTS
======================= */
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");

/* =======================
   ROUTES
======================= */
const authRoutes = require("./routes/auth.routes");
const restaurantRoutes = require("./routes/restaurant.routes");
const userRoutes = require("./routes/user.routes");
const searchRoutes = require("./routes/search.routes");
const orderRoutes = require("./routes/order.routes");
const uploadRoutes = require("./routes/upload.routes");
const paymentRoutes = require("./routes/payment.routes");
const adminRoutes = require("./routes/admin.routes");
const menuImageRoutes = require("./routes/menuImage.routes");
const restaurantImageRoutes = require("./routes/restaurantImage.routes");
const profileImageRoutes = require("./routes/profileImage.routes");
const registrationImageRoutes = require("./routes/registrationImage.routes");
const reviewRoutes = require("./routes/review.routes");

/* =======================
   APP & SERVER
======================= */
const app = express();
const server = http.createServer(app);

/* =======================
   SECURITY MIDDLEWARE
======================= */
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
  })
);

/* =======================
   CORS CONFIG
======================= */
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:3000", // Local development
  "http://localhost:5174", // Legacy local development
  "http://localhost:5173", // Legacy local development
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

/* =======================
   BODY & COOKIES
======================= */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* =======================
   RATE LIMITING
======================= */
const limiter = rateLimit({
  windowMs:
    process.env.NODE_ENV === "development"
      ? 1 * 60 * 1000
      : 15 * 60 * 1000,
  max: process.env.NODE_ENV === "development" ? 500 : 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

/* =======================
   HEALTH CHECK
======================= */
app.get("/", (req, res) => {
  res.json({
    message: "Eatio Server is running!",
    status: "healthy",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
  });
});

/* =======================
   API ROUTES
======================= */
app.use("/api/auth", authRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/users", userRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/menu-images", menuImageRoutes);
app.use("/api/restaurant-images", restaurantImageRoutes);
app.use("/api/profile-images", profileImageRoutes);
app.use("/api/registration-images", registrationImageRoutes);
app.use("/api/reviews", reviewRoutes);

/* =======================
   ERROR HANDLER
======================= */
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
});

/* =======================
   SOCKET.IO
======================= */
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("✅ Socket connected:", socket.id);

  socket.on("join_order_room", (orderId) => {
    socket.join(orderId);
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });
});

app.set("socketio", io);

/* =======================
   SERVER START
======================= */
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(
        `✅ Server running on port ${PORT} (${process.env.NODE_ENV || "dev"})`
      );
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed", err);
    process.exit(1);
  });
