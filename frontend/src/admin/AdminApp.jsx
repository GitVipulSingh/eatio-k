import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'

// Admin Layout
import AdminLayout from './components/AdminLayout'

// Admin Pages
import AdminDashboard from './pages/AdminDashboard'
import RestaurantDashboard from '../client/pages/RestaurantDashboard'
import SuperAdminDashboard from '../client/pages/SuperAdminDashboard'
import MenuManagement from './pages/MenuManagement'
import OrderManagement from './pages/OrderManagement'
import RestaurantSettings from './pages/RestaurantSettings'

// Common components
import LoadingSpinner from '../common/components/LoadingSpinner'

const AdminApp = () => {
  const { user, isAuthenticated } = useSelector(state => state.auth)

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />
  }

  if (!user) {
    return <LoadingSpinner message="Loading admin panel..." fullScreen />
  }

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Routes>
          {/* Super Admin Routes */}
          {user.role === 'superadmin' && (
            <>
              <Route path="/" element={<Navigate to="/super-admin/dashboard" replace />} />
              <Route path="/dashboard" element={<SuperAdminDashboard />} />
              <Route path="/restaurants" element={<SuperAdminDashboard />} />
            </>
          )}
          
          {/* Restaurant Admin Routes */}
          {user.role === 'admin' && (
            <>
              <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/dashboard" element={<RestaurantDashboard />} />
              <Route path="/menu" element={<MenuManagement />} />
              <Route path="/orders" element={<OrderManagement />} />
              <Route path="/settings" element={<RestaurantSettings />} />
            </>
          )}
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </motion.div>
    </AdminLayout>
  )
}

export default AdminApp