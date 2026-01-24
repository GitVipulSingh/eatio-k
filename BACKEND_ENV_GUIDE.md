# 🔧 Backend Environment Configuration Guide

## ✅ **Fixed: Single Frontend URL Configuration**

### **What Changed:**
- ❌ **Removed:** `ADMIN_URL` (not needed for single frontend deployment)
- ✅ **Kept:** `CLIENT_URL` (your single Vercel deployment URL)

## 📋 **Backend Environment Variables**

### **Local Development (.env)**
```env
# MongoDB connection
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# Server configuration
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_here

# Frontend URL (Single deployment)
CLIENT_URL=http://localhost:3000

# Payment Gateway
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# SMS Service
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Image Storage
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Super Admin Credentials
SUPERADMIN_NAME=Super Admin
SUPERADMIN_EMAIL=superadmin@yourdomain.com
SUPERADMIN_PHONE=1234567890
SUPERADMIN_PASSWORD=YourSecurePassword123
```

### **Production (Render Environment Variables)**
```env
# MongoDB connection
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# Server configuration
NODE_ENV=production
PORT=5000
JWT_SECRET=your_secure_jwt_secret_here

# Frontend URL (Single Vercel deployment)
CLIENT_URL=https://your-app.vercel.app

# Payment Gateway (Production keys)
RAZORPAY_KEY_ID=rzp_live_your_production_key
RAZORPAY_KEY_SECRET=your_production_secret

# SMS Service
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Image Storage
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Super Admin Credentials
SUPERADMIN_NAME=Super Admin
SUPERADMIN_EMAIL=admin@yourdomain.com
SUPERADMIN_PHONE=1234567890
SUPERADMIN_PASSWORD=YourSecurePassword123
```

## 🌐 **CORS Configuration**

The backend now allows requests from:
- ✅ `process.env.CLIENT_URL` (your single frontend URL)
- ✅ `http://localhost:3000` (local development)
- ✅ Legacy localhost ports (for backward compatibility)

```javascript
// Updated CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL,           // Your single frontend URL
  "http://localhost:3000",          // Local development
  "http://localhost:5174",          // Legacy support
  "http://localhost:5173",          // Legacy support
].filter(Boolean);
```

## 🎯 **How It Works**

### **Single CLIENT_URL handles all user types:**

#### **Local Development:**
- **CLIENT_URL:** `http://localhost:3000`
- **Customer:** `http://localhost:3000/`
- **Admin:** `http://localhost:3000/admin/dashboard`
- **SuperAdmin:** `http://localhost:3000/super-admin/dashboard`

#### **Production:**
- **CLIENT_URL:** `https://your-app.vercel.app`
- **Customer:** `https://your-app.vercel.app/`
- **Admin:** `https://your-app.vercel.app/admin/dashboard`
- **SuperAdmin:** `https://your-app.vercel.app/super-admin/dashboard`

## 🚀 **Deployment Steps**

### **1. Render Backend Setup:**
1. **Root Directory:** `eatio-backend/server`
2. **Build Command:** `npm install`
3. **Start Command:** `npm start`
4. **Environment Variables:** Set all the production variables above

### **2. Key Environment Variables to Set in Render:**
```env
NODE_ENV=production
CLIENT_URL=https://your-app.vercel.app
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
RAZORPAY_KEY_ID=rzp_live_your_production_key
RAZORPAY_KEY_SECRET=your_production_secret
```

## ✅ **Benefits of Single CLIENT_URL**

### **1. Simplified Configuration**
- ✅ Only one URL to manage
- ✅ Easier CORS setup
- ✅ Less environment variables

### **2. Better Security**
- ✅ Single trusted origin
- ✅ Consistent security policies
- ✅ Easier to monitor and secure

### **3. Easier Maintenance**
- ✅ One URL to update when deploying
- ✅ Consistent across all environments
- ✅ Less configuration errors

## 🧪 **Testing**

### **Local Development:**
```bash
# Backend should allow requests from:
# ✅ http://localhost:3000 (your frontend)
# ✅ All routes: /, /admin/dashboard, /super-admin/dashboard
```

### **Production:**
```bash
# Backend should allow requests from:
# ✅ https://your-app.vercel.app (your frontend)
# ✅ All routes: /, /admin/dashboard, /super-admin/dashboard
```

## 🎉 **Summary**

**Before (Multiple URLs):**
```env
CLIENT_URL=http://localhost:3000
ADMIN_URL=http://localhost:3000/admin  # ❌ Not needed
```

**After (Single URL):**
```env
CLIENT_URL=http://localhost:3000  # ✅ Handles all user types
```

**Your backend is now perfectly configured for single frontend deployment!** 🚀