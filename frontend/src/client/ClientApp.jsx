import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { motion } from 'framer-motion'

// Layout components
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'

// Common components
import ProtectedRoute from '../common/components/ProtectedRoute'

// Pages
import HomePage from './pages/HomePage'
import RestaurantDetailPage from './pages/RestaurantDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderHistoryPage from './pages/OrderHistoryPage'
import OrderDetailPage from './pages/OrderDetailPage'
import PaymentSuccessPage from './pages/PaymentSuccessPage'
import SearchResultsPage from './pages/SearchResultsPage'
import ProfilePage from './pages/ProfilePage'
import NotFoundPage from './pages/NotFoundPage'

const ClientApp = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
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
          <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/payment-success" element={<PaymentSuccessPage />} />
          
          {/* Protected Customer Routes */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/profile/orders" element={
            <ProtectedRoute>
              <OrderHistoryPage />
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
          
          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </motion.main>
      
      <Footer />
    </div>
  )
}

export default ClientApp