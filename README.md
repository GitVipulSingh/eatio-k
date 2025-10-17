# 🍕 Eatio - Unified Food Delivery Platform

A full-stack food delivery application built with the MERN stack, featuring a unified React frontend with role-based access control and a robust Express.js backend.

## 🚀 Features

### Frontend (React + Material-UI + Tailwind)
- **Modern UI/UX**: Beautiful, responsive design with Material-UI components
- **Dark/Light Theme**: System preference detection with manual toggle
- **Real-time Updates**: Live order tracking with Socket.IO
- **Advanced State Management**: Redux Toolkit + React Query for optimal performance
- **Smooth Animations**: Framer Motion for delightful user interactions
- **Accessibility**: WCAG compliant with keyboard navigation
- **Performance Optimized**: Code splitting, lazy loading, and caching

### Backend (Express.js + MongoDB)
- **Secure Authentication**: JWT-based auth with role-based access control
- **Restaurant Management**: Complete CRUD operations for restaurants and menus
- **Order Processing**: Full order lifecycle management
- **Payment Integration**: Razorpay integration for secure payments
- **File Upload**: Cloudinary integration for image management
- **Real-time Communication**: Socket.IO for live updates
- **Security**: Helmet, CORS, rate limiting, and input validation

## 🛠️ Tech Stack

### Frontend
- **React 18** - Latest React with concurrent features
- **Material-UI (MUI)** - Comprehensive component library
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Production-ready animations
- **React Query** - Data fetching and caching
- **Redux Toolkit** - State management
- **React Hook Form** - Form handling and validation
- **Vite** - Fast build tool and dev server

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **Socket.IO** - Real-time communication
- **Cloudinary** - Image and video management
- **Razorpay** - Payment processing

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd eatio-unified
   ```

2. **Setup project (from root directory)**
   ```bash
   npm run setup
   ```
   
   This will automatically install dependencies for both frontend and backend.

3. **Environment Setup**
   
   **Backend (.env in zomato-clone/server/)**
   ```env
   MONGO_URI=your_mongodb_connection_string
   PORT=5000
   JWT_SECRET=your_jwt_secret_key
   CLIENT_URL=http://localhost:5174
   ADMIN_URL=http://localhost:5173
   
   # Cloudinary (for image uploads)
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   
   # Razorpay (for payments)
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   
   # Twilio (for SMS - optional)
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number
   ```

   **Frontend (.env in eatio-frontend/)**
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   VITE_CLIENT_URL=http://localhost:5174
   ```

4. **Start development (from root directory)**
   ```bash
   npm run dev
   ```

   **✅ Integrated Startup Process:**
   - ✅ **Backend starts first** on http://localhost:5000 (with health check endpoint)
   - ✅ **Frontend waits** for server to be ready via health check
   - ✅ **Frontend starts** on http://localhost:3000 only after backend is confirmed running
   - ✅ **Both servers managed** in single terminal with concurrently
   - ✅ **No port conflicts** - servers start in proper sequence automatically

   **Alternative: Start individually**
   ```bash
   npm run dev:backend    # Backend only
   npm run dev:frontend   # Frontend only (requires backend running)
   ```

## 🏗️ Project Structure

```
eatio-unified/
├── README.md              # Project documentation
├── package.json           # Root orchestration scripts
├── frontend/              # Unified React frontend
│   ├── src/
│   │   ├── routes/        # Centralized routing system
│   │   ├── pages/         # Page components organized by role
│   │   │   ├── auth/      # Authentication pages
│   │   │   ├── customer/  # Customer pages
│   │   │   ├── admin/     # Restaurant admin pages
│   │   │   └── superadmin/# Super admin pages
│   │   ├── components/    # Shared components
│   │   │   └── layouts/   # Layout components
│   │   ├── client/        # Legacy client components (to be migrated)
│   │   ├── admin/         # Legacy admin components (to be migrated)
│   │   ├── common/        # Shared utilities & components
│   │   └── App.jsx        # Main app entry point
│   ├── package.json       # Frontend dependencies & scripts
│   ├── .env               # Development environment
│   ├── .env.development   # Development-specific config
│   ├── .env.production    # Production-specific config
│   └── .gitignore         # Frontend-specific ignores
│
└── zomato-clone/          # Backend
    ├── .gitignore         # Backend-specific ignores
    └── server/
        ├── controllers/   # Route controllers
        ├── models/        # MongoDB models
        ├── routes/        # API routes
        ├── middlewares/   # Custom middlewares
        ├── config/        # Database & service configs
        ├── server.js      # Main server file
        ├── package.json   # Backend dependencies & scripts
        ├── .env           # Backend environment variables
        └── .gitignore     # Server-specific ignores
```

## 🔧 Available Scripts

### Root Level (Integrated Commands)
- `npm install` - Install dependencies for both frontend and backend
- `npm run dev` - **Start both servers** (backend first, then frontend)
- `npm run build` - Build frontend for production
- `npm run start` - Start both servers in production mode
- `npm run setup` - Complete setup with dependency installation

### Individual Commands
- `npm run dev:backend` - Start only backend server
- `npm run dev:frontend` - Start only frontend (waits for backend)

### Backend (zomato-clone/server/)
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server

### Frontend (frontend/)
- `npm run dev` - Start development server (port 3000)
- `npm run dev:wait` - Start frontend after waiting for backend health check
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🎭 Role-Based Routing & Authentication

### **Landing Experience (Unauthenticated Users)**
- **Landing Page** → Professional landing page with signup options
- **Restaurant Preview** → Browse restaurants without ordering
- **Search** → Search restaurants and view details
- **Auth Pages** → Login and role-specific signup

### **Customer Role (`role: customer`)**
- **Home Dashboard** → Browse and order from restaurants
- **Restaurant Details** → View menus and place orders
- **Cart & Checkout** → Complete order process with payment
- **Order History** → Track current and past orders
- **Profile Management** → Update personal information

### **Restaurant Admin Role (`role: admin`)**
- **Restaurant Dashboard** → Overview of orders and performance
- **Menu Management** → Add, edit, delete menu items
- **Order Management** → View and update order status
- **Restaurant Settings** → Update restaurant information
- **Note:** New restaurants require superadmin approval before going live

### **Super Admin Role (`role: superadmin`)**
- **Admin Dashboard** → System overview and analytics
- **Restaurant Approvals** → Approve/reject new restaurant applications
- **User Management** → Manage all users and roles
- **System Settings** → Configure platform settings

## 🚪 Signup Flows

### **Customer Signup**
1. Click "Sign Up" on landing page or header
2. Fill customer registration form
3. Account created with `role: customer`
4. Immediate access to customer features

### **Restaurant Signup**
1. Click "Partner With Us" in footer
2. Fill detailed restaurant application form
3. Account created with `role: admin` but `status: pending`
4. Must wait for superadmin approval
5. Once approved, full restaurant dashboard access

## 🔒 Route Protection

### **Public Routes**
- `/` - Landing page
- `/auth/login` - Login page
- `/auth/register/customer` - Customer signup
- `/auth/register/restaurant` - Restaurant signup
- `/restaurants/:id` - Restaurant details (view only)
- `/search` - Search results (view only)

### **Customer Protected Routes**
- `/` - Customer home (after login)
- `/cart` - Shopping cart
- `/checkout` - Order checkout
- `/profile` - User profile
- `/profile/orders` - Order history

### **Admin Protected Routes**
- `/admin/dashboard` - Restaurant dashboard
- `/admin/menu` - Menu management
- `/admin/orders` - Order management

### **Super Admin Protected Routes**
- `/super-admin/dashboard` - Admin dashboard
- `/super-admin/restaurants` - Restaurant approvals

### **Unauthorized Access**
- Redirects to `/unauthorized` with 403 error page
- Clear explanation and navigation options

### Frontend (eatio-frontend/)
- `npm run dev` - Start development server (port 5174)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend (zomato-clone/server/)
- `npm run dev` - Start with nodemon (port 5000)
- `npm start` - Start production server

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset

### Restaurants
- `GET /api/restaurants` - Get all approved restaurants
- `GET /api/restaurants/:id` - Get restaurant by ID
- `POST /api/restaurants/menu` - Add menu item (admin only)
- `PUT /api/restaurants/menu/:id` - Update menu item (admin only)
- `DELETE /api/restaurants/menu/:id` - Delete menu item (admin only)

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/history` - Get user's order history
- `GET /api/orders/:id` - Get order by ID

### Payments
- `POST /api/payment/create-order` - Create Razorpay order
- `POST /api/payment/verify` - Verify payment

### Search
- `GET /api/search` - Search restaurants and dishes

## 🎨 Design System

### Colors
- **Primary**: Orange (#f97316) - Brand color for CTAs
- **Secondary**: Slate (#64748b) - Supporting elements
- **Success**: Green (#10b981) - Success states
- **Error**: Red (#ef4444) - Error states

### Typography
- **Font Family**: Inter - Modern, readable sans-serif
- **Scale**: Material-UI's typography scale

### Components
- **Cards**: Subtle shadows with hover effects
- **Buttons**: Rounded corners, smooth transitions
- **Forms**: Clean inputs with validation states
- **Navigation**: Sticky header with mobile menu

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

## 🔒 Security Features

- **Authentication**: JWT-based with HTTP-only cookies
- **Authorization**: Role-based access control (customer, admin, superadmin)
- **Input Validation**: Server-side validation with express-validator
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS**: Configured for specific origins
- **Helmet**: Security headers
- **Password Hashing**: bcrypt for secure password storage

## 🚀 Performance Optimizations

### Frontend
- **Code Splitting**: Automatic route-based splitting
- **Lazy Loading**: Images and components
- **Caching**: React Query for intelligent data caching
- **Bundle Optimization**: Vite for fast builds
- **Tree Shaking**: Unused code elimination

### Backend
- **Database Indexing**: Optimized MongoDB queries
- **Connection Pooling**: Efficient database connections
- **Compression**: Gzip compression for responses
- **Caching**: Redis-ready architecture

## 🧪 Testing

### Frontend Testing
```bash
cd eatio-frontend
npm run test
```

### Backend Testing
```bash
cd zomato-clone/server
npm run test
```

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. Build the frontend: `npm run build`
2. Deploy the `dist` folder
3. Set environment variables in deployment platform

### Backend (Railway/Heroku/DigitalOcean)
1. Set up MongoDB Atlas
2. Configure environment variables
3. Deploy the server folder
4. Set up domain and SSL

### Full-Stack (Docker)
```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Material-UI team for the excellent component library
- Tailwind CSS for the utility-first approach
- Framer Motion for smooth animations
- React Query team for the data fetching solution
- Express.js community for the robust backend framework

## 📞 Support

For support, email support@eatio.com or join our Slack channel.

---

**Made with ❤️ for food lovers everywhere** 🍕🍔🍜