# 🌐 Environment Setup Guide

## 🚨 Critical: Environment Variables for Production

### **Problem Solved:**
1. ✅ **Hardcoded URLs in .env files** - Now have proper placeholders
2. ✅ **Inconsistent role-based redirects** - Centralized redirect system
3. ✅ **Three user types management** - Clear role-based navigation

## 📋 Environment Configuration

### **1. Local Development (.env)**
```env
# Local Development URLs
VITE_API_URL=http://localhost:5000/api
VITE_CLIENT_URL=http://localhost:3000
VITE_ADMIN_URL=http://localhost:3000/admin

# App Configuration
VITE_APP_NAME=Eatio

# Payment (Test Keys)
VITE_RAZORPAY_KEY_ID=rzp_test_R9gkQtj6uzh9xT

# Feature Flags
VITE_FEATURE_FLAG_ADMIN_DASHBOARD=true
VITE_FEATURE_FLAG_PAYMENT_GATEWAY=true
VITE_FEATURE_FLAG_RESTAURANT_SIGNUP=true
```

### **2. Production (.env.production)**
```env
# Production URLs - REPLACE WITH YOUR ACTUAL DEPLOYMENT URLS
VITE_API_URL=https://eatio-backend.onrender.com/api
VITE_CLIENT_URL=https://eatio-frontend.vercel.app
VITE_ADMIN_URL=https://eatio-frontend.vercel.app/admin

# App Configuration
VITE_APP_NAME=Eatio

# Payment (Production Keys)
VITE_RAZORPAY_KEY_ID=rzp_live_your_production_key_here

# Feature Flags
VITE_FEATURE_FLAG_ADMIN_DASHBOARD=true
VITE_FEATURE_FLAG_PAYMENT_GATEWAY=true
VITE_FEATURE_FLAG_RESTAURANT_SIGNUP=true

# Debug Settings
VITE_DEBUG_MODE=false
VITE_LOG_LEVEL=error
```

## 🎯 Three User Types Management

### **Centralized Role-Based Redirect System**

#### **1. Customer (role: 'customer')**
- **Login Redirect:** `/` (Home page)
- **Access:** Customer features, ordering, profile
- **Navigation:** Stays within main app

#### **2. Restaurant Admin (role: 'admin')**
- **Login Redirect:** `/admin/dashboard`
- **Access:** Restaurant management, menu, orders
- **Navigation:** Admin section of the app

#### **3. Super Admin (role: 'superadmin')**
- **Login Redirect:** `/super-admin/dashboard`
- **Access:** System-wide controls, restaurant approvals
- **Navigation:** Super admin section of the app

### **How It Works:**

```javascript
// Centralized redirect configuration
export const ROLE_REDIRECTS = {
  customer: '/',
  admin: '/admin/dashboard',
  superadmin: '/super-admin/dashboard'
}

// Usage in login components
navigateByRole(userData.role, navigate)
```

## 🔧 Deployment Instructions

### **Step 1: Backend on Render**
1. **Root Directory:** `eatio-backend/server`
2. **Build Command:** `npm install`
3. **Start Command:** `npm start`
4. **Environment Variables:**
```env
NODE_ENV=production
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=https://your-vercel-app.vercel.app
ADMIN_URL=https://your-vercel-app.vercel.app/admin
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
# ... other backend variables
```

### **Step 2: Frontend on Vercel**
1. **Root Directory:** `frontend`
2. **Build Command:** `npm run build`
3. **Output Directory:** `dist`
4. **Environment Variables:**
```env
VITE_API_URL=https://your-render-backend.onrender.com/api
VITE_CLIENT_URL=https://your-vercel-frontend.vercel.app
VITE_ADMIN_URL=https://your-vercel-frontend.vercel.app/admin
VITE_RAZORPAY_KEY_ID=your_production_razorpay_key
# ... other frontend variables
```

### **Step 3: Update URLs**
Replace the placeholder URLs in `.env.production` with your actual deployment URLs:

1. **Get your Render backend URL** (e.g., `https://eatio-backend-abc123.onrender.com`)
2. **Get your Vercel frontend URL** (e.g., `https://eatio-frontend-xyz789.vercel.app`)
3. **Update the .env.production file** with these actual URLs
4. **Set the same URLs in Vercel environment variables**

## 🧪 Testing Role-Based Redirects

### **Local Development Testing:**
```bash
# Start the application
npm run dev

# Test each user type:
# 1. Customer login → http://localhost:3000/
# 2. Admin login → http://localhost:3000/admin/dashboard
# 3. SuperAdmin login → http://localhost:3000/super-admin/dashboard
```

### **Production Testing:**
```bash
# Test each user type:
# 1. Customer login → https://your-app.vercel.app/
# 2. Admin login → https://your-app.vercel.app/admin/dashboard
# 3. SuperAdmin login → https://your-app.vercel.app/super-admin/dashboard
```

## ✅ Benefits of This System

### **1. Environment Flexibility**
- ✅ Works in local development
- ✅ Works in production
- ✅ Easy to change URLs without code changes

### **2. Consistent Role Management**
- ✅ All login components use same redirect logic
- ✅ Clear separation of user types
- ✅ Centralized configuration

### **3. Production Ready**
- ✅ No hardcoded URLs
- ✅ Environment-based configuration
- ✅ Proper fallbacks for reliability

### **4. Maintainable**
- ✅ Single source of truth for redirects
- ✅ Easy to add new roles
- ✅ Consistent across all components

## 🚀 Final Checklist

Before deploying to production:

- [ ] Replace placeholder URLs in `.env.production`
- [ ] Set environment variables in Vercel dashboard
- [ ] Set environment variables in Render dashboard
- [ ] Test all three user type logins
- [ ] Verify redirects work correctly
- [ ] Test payment integration with production keys
- [ ] Verify CORS settings allow your domains

**Your application now has a robust, production-ready environment configuration system!** 🎉