# Eatio Project Flow: From Localhost:3000 to Login

## 🚀 Project Overview

Eatio is a full-stack food delivery application with:
- **Frontend**: React + Vite (Port 3000)
- **Backend**: Express.js + MongoDB (Port 5000)
- **Architecture**: Cookie-based authentication with role-based access control

---

## 📋 What Happens When You Run `npm run dev`

### 1. **Root Package.json Script Execution**
**File**: `"package.json"`
```json
"dev": "concurrently --kill-others-on-fail \"npm run dev --prefix eatio-backend\" \"npm run dev --prefix frontend\""
```

This command starts both servers simultaneously:
- Backend server on port 5000
- Frontend server on port 3000

### 2. **Backend Server Startup**
**File**: `"eatio-backend/server/server.js"`

The backend initializes in this order:
1. **Environment Setup**: Loads `.env` variables
2. **Database Connection**: Connects to MongoDB via `"eatio-backend/server/config/db.js"`
3. **Middleware Setup**:
   - CORS configuration for frontend communication
   - Cookie parser for authentication
   - Rate limiting for security
   - Helmet for security headers
4. **Route Registration**: All API routes are mounted under `/api/`
5. **Socket.IO Setup**: Real-time communication for order updates
6. **Server Listen**: Starts listening on port 5000

### 3. **Frontend Server Startup**
**File**: `"frontend/package.json"`
```json
"dev": "vite --port 3000"
```

Vite development server starts on port 3000 and serves the React application.

---

## 🌐 What Happens When You Visit `localhost:3000`

### 1. **HTML Entry Point**
**File**: `"frontend/index.html"`

The browser loads the base HTML template which:
- Sets up the document structure
- Loads Google Fonts (Inter)
- Includes Razorpay payment script
- Creates a `<div id="root">` container
- Loads the main JavaScript entry point

### 2. **React Application Bootstrap**
**File**: `"frontend/src/main.jsx"`

The React application initializes with multiple providers:

```jsx
ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>           {/* Redux for state management */}
    <QueryClientProvider client={queryClient}>  {/* React Query for API calls */}
      <ThemeContextProvider>         {/* Custom theme context */}
        <ThemeProvider theme={theme}> {/* Material-UI theme */}
          <App />                    {/* Main application component */}
        </ThemeProvider>
      </ThemeContextProvider>
    </QueryClientProvider>
  </Provider>
)
```

### 3. **Main App Component Loading**
**File**: `"frontend/src/App.jsx"`

The App component performs these critical tasks:

1. **Authentication Check**: 
   - Checks `localStorage` for existing user data
   - If found, attempts to validate with backend via `useUserProfile` query

2. **Route Configuration**: 
   - Loads the routing system from `"frontend/src/routes/index.jsx"`

3. **Socket Connection**: 
   - Establishes WebSocket connection for real-time features

### 4. **Routing System**
**File**: `"frontend/src/routes/index.jsx"`

The router determines what page to show based on:
- **Authentication Status**: `isAuthenticated` from Redux store
- **User Role**: `customer`, `admin`, or `superadmin`
- **Current URL Path**: Browser location

**For Unauthenticated Users** (First Visit):
```jsx
{!isAuthenticated && (
  <Route path="/*" element={
    <LandingLayout>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </LandingLayout>
  } />
)}
```

### 5. **Landing Page Display**
**File**: `"frontend/src/pages/LandingPage.jsx"`

The landing page shows:
- Hero section with call-to-action
- Featured restaurants
- Login/Register buttons
- Navigation menu

---

## 🔐 Complete Login Flow (Step-by-Step)

### Step 1: User Clicks "Login" Button

**Location**: Landing page or navigation menu
**Action**: Navigates to `/auth/login`

### Step 2: Login Page Renders
**File**: `"frontend/src/pages/auth/LoginPage.jsx"`

The login page displays:
- Email/password form using React Hook Form
- Password visibility toggle
- "Back to Home" navigation
- Form validation rules

### Step 3: User Submits Login Form

**Frontend Process**:
1. **Form Validation**: React Hook Form validates email format and required fields
2. **API Call Preparation**: 
   ```jsx
   const onSubmit = async (data) => {
     const userData = await loginMutation.mutateAsync({
       email: data.email,
       password: data.password,
     })
   }
   ```

### Step 4: API Request to Backend
**File**: `"frontend/src/client/api/queries.js"`

The `useLogin` mutation executes:
```javascript
mutationFn: async (credentials) => {
  const { data } = await api.post('/auth/login', {
    loginIdentifier: credentials.email, // Backend expects loginIdentifier
    password: credentials.password
  })
  return data
}
```

**HTTP Request Details**:
- **Method**: POST
- **URL**: `http://localhost:5000/api/auth/login`
- **Headers**: `Content-Type: application/json`, `withCredentials: true`
- **Body**: `{ loginIdentifier: "user@email.com", password: "userpassword" }`

### Step 5: Backend Authentication Processing
**File**: `"eatio-backend/server/routes/auth.routes.js"`

Request hits the auth route:
```javascript
router.post('/login', loginUser);
```

**File**: `"eatio-backend/server/controllers/auth.controller.js"`

The `loginUser` controller function:

1. **User Lookup**:
   ```javascript
   const user = await User.findOne({
     $or: [{ email: loginIdentifier }, { phone: loginIdentifier }],
   });
   ```

2. **Password Verification**:
   ```javascript
   if (user && (await user.matchPassword(password))) {
     // Authentication successful
   }
   ```

3. **JWT Token Generation**:
   **File**: `"eatio-backend/server/utils/generateToken.js"`
   ```javascript
   const generateToken = (res, userId, role) => {
     const token = jwt.sign({ userId, role }, process.env.JWT_SECRET, {
       expiresIn: '30d',
     });
     
     const cookieName = `jwt_${role}`; // e.g., jwt_customer, jwt_admin
     
     res.cookie(cookieName, token, {
       httpOnly: true,
       secure: process.env.NODE_ENV === 'production',
       sameSite: 'strict',
       maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
     });
   };
   ```

4. **Response Sent**:
   ```javascript
   res.status(200).json({
     _id: user._id,
     name: user.name,
     email: user.email,
     phone: user.phone,
     role: user.role,
   });
   ```

### Step 6: Frontend Receives Response
**File**: `"frontend/src/client/api/apiService.js"`

The axios interceptor logs the successful response:
```javascript
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: POST /auth/login`, response.data)
    return response
  }
)
```

### Step 7: Redux State Update
**File**: `"frontend/src/client/api/queries.js"`

The login mutation's `onSuccess` callback:
```javascript
onSuccess: (data) => {
  const userInfo = {
    user: data,
    token: 'cookie-based' // Since backend uses cookies
  }
  localStorage.setItem('userInfo', JSON.stringify(userInfo))
  queryClient.setQueryData([QUERY_KEYS.user], data)
}
```

**File**: `"frontend/src/pages/auth/LoginPage.jsx"`

The login page dispatches Redux action:
```javascript
dispatch(loginSuccess({ user: userData }))
```

**File**: `"frontend/src/client/store/slices/authSlice.js"`

Redux store updates:
```javascript
loginSuccess: (state, action) => {
  state.user = action.payload.user
  state.isAuthenticated = true
  state.loading = false
  localStorage.setItem('userInfo', JSON.stringify(action.payload))
}
```

### Step 8: Route-Based Redirection
**File**: `"frontend/src/pages/auth/LoginPage.jsx"`

Based on user role, redirect occurs:
```javascript
// Redirect based on role
if (userData.role === 'admin') {
  navigate('/admin/dashboard')
} else if (userData.role === 'superadmin') {
  navigate('/super-admin/dashboard')
} else {
  navigate('/') // Customer goes to home page
}
```

### Step 9: Router Re-evaluation
**File**: `"frontend/src/routes/index.jsx"`

The router detects the authentication state change and renders appropriate routes:

**For Customer**:
```jsx
{isAuthenticated && user?.role === 'customer' && (
  <Route path="/*" element={
    <CustomerLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        // ... other customer routes
      </Routes>
    </CustomerLayout>
  } />
)}
```

**For Admin**:
```jsx
{isAuthenticated && user?.role === 'admin' && (
  <Route path="/*" element={
    <AdminLayout>
      <Routes>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/menu" element={<MenuManagement />} />
        <Route path="/admin/orders" element={<OrderManagement />} />
        // ... other admin routes
      </Routes>
    </AdminLayout>
  } />
)}
```

### Step 10: Dashboard/Home Page Renders

The appropriate dashboard loads based on user role:
- **Customer**: `"frontend/src/pages/customer/HomePage.jsx"` - Shows restaurants, search, cart
- **Admin**: `"frontend/src/pages/admin/AdminDashboard.jsx"` - Shows restaurant management tools
- **SuperAdmin**: `"frontend/src/pages/superadmin/SuperAdminDashboard.jsx"` - Shows system-wide controls

---

## 🔄 Persistent Authentication

### On Page Refresh/Reload:

1. **App.jsx** checks `localStorage` for `userInfo`
2. If found, makes API call to `"eatio-backend/server/routes/user.routes.js"` via `/users/profile`
3. Backend validates the JWT cookie and returns user data
4. Redux store is updated with user information
5. Router redirects to appropriate dashboard

### Cookie-Based Security:

- **HttpOnly**: Prevents XSS attacks (JavaScript cannot access cookies)
- **Secure**: HTTPS-only in production
- **SameSite**: Prevents CSRF attacks
- **Role-Specific**: Different cookie names for different roles (`jwt_customer`, `jwt_admin`, `jwt_superadmin`)

---

## 🎯 Key Files Summary

| Component | File Path | Purpose |
|-----------|-----------|---------|
| **Server Entry** | `"eatio-backend/server/server.js"` | Main backend server setup |
| **Frontend Entry** | `"frontend/src/main.jsx"` | React app initialization |
| **Routing** | `"frontend/src/routes/index.jsx"` | Route configuration and protection |
| **Login Page** | `"frontend/src/pages/auth/LoginPage.jsx"` | Login form and UI |
| **Auth Controller** | `"eatio-backend/server/controllers/auth.controller.js"` | Login logic and JWT generation |
| **Auth Routes** | `"eatio-backend/server/routes/auth.routes.js"` | Authentication endpoints |
| **Redux Store** | `"frontend/src/client/store/slices/authSlice.js"` | Authentication state management |
| **API Service** | `"frontend/src/client/api/apiService.js"` | HTTP client configuration |
| **Token Utils** | `"eatio-backend/server/utils/generateToken.js"` | JWT token generation |

This architecture ensures secure, role-based authentication with persistent sessions and real-time capabilities for the food delivery platform.