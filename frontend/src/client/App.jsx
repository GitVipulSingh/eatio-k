import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'

// Components
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import LoadingSpinner from './components/ui/LoadingSpinner'
import ProtectedRoute from './components/auth/ProtectedRoute'

// Pages
import HomePage from './pages/HomePage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import RoleSelectionPage from './pages/auth/RoleSelectionPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ProfilePage from './pages/ProfilePage'
import RestaurantDetailPage from './pages/RestaurantDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderHistoryPage from './pages/OrderHistoryPage'
import OrderDetailPage from './pages/OrderDetailPage'
import PaymentSuccessPage from './pages/PaymentSuccessPage'
import RestaurantDashboard from './pages/RestaurantDashboard'
import SuperAdminDashboard from './pages/SuperAdminDashboard'
import SearchResultsPage from './pages/SearchResultsPage'
import NotFoundPage from './pages/NotFoundPage'

// Hooks
import { useUserProfile } from './api/queries'
import { loginSuccess, logout } from './store/slices/authSlice'

function App() {
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector(state => state.auth)
  
  // Only fetch user profile if we think user is authenticated
  const { data: user, isLoading, error } = useUserProfile()

  useEffect(() => {
    if (user && !isAuthenticated) {
      dispatch(loginSuccess({ user }))
    }
  }, [user, dispatch, isAuthenticated])

  // Handle authentication errors
  useEffect(() => {
    if (error?.response?.status === 401) {
      dispatch(logout())
    }
  }, [error, dispatch])

  // Show loading only if we're checking authentication and user should be logged in
  if (isLoading && localStorage.getItem('userInfo')) {
    return <LoadingSpinner message="Welcome to Eatio! 🍕" fullScreen={true} />
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        <Header />
        
        <AnimatePresence mode="wait">
          <motion.main 
            className="flex-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RoleSelectionPage />} />
              <Route path="/register/customer" element={<RegisterPage />} />
              <Route path="/register/admin" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />
              <Route path="/search" element={<SearchResultsPage />} />
              <Route path="/payment-success" element={<PaymentSuccessPage />} />
              
              {/* Protected Routes - Customer */}
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              <Route path="/cart" element={
                <ProtectedRoute>
                  <CartPage />
                </ProtectedRoute>
              } />
              <Route path="/checkout" element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              } />
              <Route path="/order-history" element={
                <ProtectedRoute>
                  <OrderHistoryPage />
                </ProtectedRoute>
              } />
              <Route path="/orders/:id" element={
                <ProtectedRoute>
                  <OrderDetailPage />
                </ProtectedRoute>
              } />
              
              {/* Protected Routes - Restaurant Admin */}
              <Route path="/restaurant-dashboard" element={
                <ProtectedRoute requiredRole="admin">
                  <RestaurantDashboard />
                </ProtectedRoute>
              } />
              
              {/* Protected Routes - Super Admin */}
              <Route path="/super-admin" element={
                <ProtectedRoute requiredRole="superadmin">
                  <SuperAdminDashboard />
                </ProtectedRoute>
              } />
              
              {/* 404 Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </motion.main>
        </AnimatePresence>
        
        <Footer />
      </div>
    </Router>
  )
}

export default App