# 🚀 Eatio Deployment Guide

## ✅ Fixed Issues

### 🔧 Redirect Problems Fixed:
1. **Hardcoded localhost URLs** - All replaced with environment variables
2. **Frontend navigating to backend routes** - Fixed with proper URL configuration
3. **Razorpay redirects** - Now use dynamic URLs for both local and production
4. **Superadmin login redirects** - Properly configured for all environments
5. **Admin dashboard redirects** - Fixed to use environment-based URLs

### 🌐 Environment Configuration

#### **Local Development (.env.development)**
```env
VITE_API_URL=http://localhost:5000/api
VITE_CLIENT_URL=http://localhost:3000
VITE_ADMIN_URL=http://localhost:3000/admin
VITE_APP_NAME=Eatio
VITE_RAZORPAY_KEY_ID=rzp_test_your_razorpay_key_here
VITE_FEATURE_FLAG_ADMIN_DASHBOARD=true
VITE_FEATURE_FLAG_PAYMENT_GATEWAY=true
VITE_FEATURE_FLAG_RESTAURANT_SIGNUP=true
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=debug
```

#### **Production (.env.production)**
```env
VITE_API_URL=https://your-render-backend.onrender.com/api
VITE_CLIENT_URL=https://your-vercel-frontend.vercel.app
VITE_ADMIN_URL=https://your-vercel-frontend.vercel.app/admin
VITE_APP_NAME=Eatio
VITE_RAZORPAY_KEY_ID=your_production_razorpay_key_here
VITE_FEATURE_FLAG_ADMIN_DASHBOARD=true
VITE_FEATURE_FLAG_PAYMENT_GATEWAY=true
VITE_FEATURE_FLAG_RESTAURANT_SIGNUP=true
VITE_DEBUG_MODE=false
VITE_LOG_LEVEL=error
```

## 🎯 Deployment Settings

### **Backend on Render**
- **Root Directory:** `eatio-backend/server`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

#### **Environment Variables for Render:**
```env
NODE_ENV=production
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=https://your-vercel-app.vercel.app
ADMIN_URL=https://your-vercel-app.vercel.app/admin
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_phone
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
SUPERADMIN_NAME=Super Admin
SUPERADMIN_EMAIL=admin@yourdomain.com
SUPERADMIN_PHONE=1234567890
SUPERADMIN_PASSWORD=YourSecurePassword123
```

### **Frontend on Vercel**
- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Install Command:** `npm install`
- **Output Directory:** `dist`

#### **Environment Variables for Vercel:**
```env
VITE_API_URL=https://your-render-app.onrender.com/api
VITE_CLIENT_URL=https://your-vercel-app.vercel.app
VITE_ADMIN_URL=https://your-vercel-app.vercel.app/admin
VITE_APP_NAME=Eatio
VITE_APP_VERSION=1.0.0
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
VITE_FEATURE_FLAG_ADMIN_DASHBOARD=true
VITE_FEATURE_FLAG_PAYMENT_GATEWAY=true
VITE_FEATURE_FLAG_RESTAURANT_SIGNUP=true
VITE_DEBUG_MODE=false
VITE_LOG_LEVEL=info
```

## 🔧 Key Fixes Applied

### 1. **Centralized API Configuration**
Created `frontend/src/config/api.js` for consistent URL handling:
- Dynamic API URLs based on environment
- Socket URL configuration
- Image URL helpers
- Debug logging utilities

### 2. **Fixed Hardcoded URLs**
- ✅ `frontend/src/client/legacy/pages/RegisterPage.jsx`
- ✅ `frontend/src/client/legacy/pages/LoginPage.jsx`
- ✅ `frontend/src/admin/pages/DashboardPage.jsx`
- ✅ `frontend/src/admin/App.jsx`
- ✅ `frontend/src/contexts/SocketContext.jsx`
- ✅ All admin API calls now use centralized configuration

### 3. **Environment Variable Fallbacks**
All URLs now have proper fallbacks:
```javascript
const clientUrl = import.meta.env.VITE_CLIENT_URL || window.location.origin;
const adminUrl = import.meta.env.VITE_ADMIN_URL || `${window.location.origin}/admin`;
```

### 4. **Socket.IO Configuration**
Fixed socket connections to use dynamic URLs:
```javascript
const socketUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
```

## 🧪 Testing

### **Local Development**
1. Run `npm run dev` from root directory
2. Backend: http://localhost:5000
3. Frontend: http://localhost:3000
4. Admin: http://localhost:3000/admin

### **Production Testing**
1. Test all redirect flows:
   - Login → Dashboard redirects
   - Logout → Login redirects
   - Payment → Success redirects
   - Admin → Client redirects

2. Verify environment variables are loaded correctly
3. Check socket connections work across domains
4. Test Razorpay integration with production keys

## 🚨 Important Notes

1. **CORS Configuration**: Ensure backend CORS allows your Vercel domain
2. **Cookie Settings**: Update cookie domain settings for production
3. **Socket.IO**: Verify socket connections work across different domains
4. **Payment Testing**: Use Razorpay test keys for staging, production keys for live

## 🎉 Benefits

- ✅ **No more hardcoded URLs**
- ✅ **Works in both local and production**
- ✅ **Proper environment-based configuration**
- ✅ **Centralized API management**
- ✅ **Debug logging for development**
- ✅ **Fallback URLs for reliability**

Your application is now ready for deployment with proper URL handling! 🚀