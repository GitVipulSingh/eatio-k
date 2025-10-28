import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

// Layout Components
import LandingLayout from '../components/layouts/LandingLayout'
import CustomerLayout from '../components/layouts/CustomerLayout'
import AdminLayout from '../components/layouts/AdminLayout'

// Auth Components
import LoginPage from '../pages/auth/LoginPage'
import CustomerRegisterPage from '../pages/auth/CustomerRegisterPage'
import RestaurantRegisterPage from '../pages/auth/RestaurantRegisterPage'

// Landing Pages
import LandingPage from '../pages/LandingPage'
import AboutPage from '../pages/AboutPage'

// Customer Pages
import HomePage from '../pages/customer/HomePage'
import RestaurantDetailPage from '../pages/customer/RestaurantDetailPage'
import CartPage from '../pages/customer/CartPage'
import CheckoutPage from '../pages/customer/CheckoutPage'
import OrderHistoryPage from '../pages/customer/OrderHistoryPage'
import ProfilePage from '../pages/customer/ProfilePage'
import SearchResultsPage from '../pages/customer/SearchResultsPage'

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard'
import MenuManagement from '../pages/admin/MenuManagement'
import OrderManagement from '../pages/admin/OrderManagement'

// Super Admin Pages
import SuperAdminDashboard from '../pages/superadmin/SuperAdminDashboard'
import RestaurantApproval from '../pages/superadmin/RestaurantApproval'

// 403 Unauthorized Page
import UnauthorizedPage from '../pages/UnauthorizedPage'

const AppRoutes = () => {
  const { isAuthenticated, user } = useSelector(state => state.auth)

  // Debug logging
  console.log('AppRoutes - isAuthenticated:', isAuthenticated, 'user:', user)
  console.log('AppRoutes - localStorage userInfo:', localStorage.getItem('userInfo'))

  return (
    <Routes>
      {/* Public Auth Routes - Always accessible */}
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register/customer" element={<CustomerRegisterPage />} />
      <Route path="/auth/register/restaurant" element={<RestaurantRegisterPage />} />

      {/* Legacy redirects */}
      <Route path="/login" element={<Navigate to="/auth/login" replace />} />
      <Route path="/register" element={<Navigate to="/auth/register/customer" replace />} />

      {/* Unauthorized page */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Conditional Routes based on authentication */}
      {isAuthenticated && user?.role === 'customer' && (
        <Route path="/*" element={
          <CustomerLayout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/orders" element={<OrderHistoryPage />} />
              <Route path="/order-history" element={<OrderHistoryPage />} />
              <Route path="/search" element={<SearchResultsPage />} />
              <Route path="/admin/*" element={<Navigate to="/unauthorized" replace />} />
              <Route path="/super-admin/*" element={<Navigate to="/unauthorized" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </CustomerLayout>
        } />
      )}

      {isAuthenticated && user?.role === 'admin' && (
        <Route path="/*" element={
          <AdminLayout>
            <Routes>
              <Route path="/about" element={<AboutPage />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/menu" element={<MenuManagement />} />
              <Route path="/admin/orders" element={<OrderManagement />} />
              <Route path="/admin/*" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/restaurant-dashboard" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/super-admin/*" element={<Navigate to="/unauthorized" replace />} />
              <Route path="/*" element={<Navigate to="/admin/dashboard" replace />} />
            </Routes>
          </AdminLayout>
        } />
      )}

      {isAuthenticated && user?.role === 'superadmin' && (
        <Route path="/*" element={
          <AdminLayout>
            <Routes>
              <Route path="/about" element={<AboutPage />} />
              <Route path="/super-admin/dashboard" element={<SuperAdminDashboard />} />
              <Route path="/super-admin/restaurants" element={<RestaurantApproval />} />
              <Route path="/super-admin/*" element={<Navigate to="/super-admin/dashboard" replace />} />
              <Route path="/admin/*" element={<Navigate to="/unauthorized" replace />} />
              <Route path="/*" element={<Navigate to="/super-admin/dashboard" replace />} />
            </Routes>
          </AdminLayout>
        } />
      )}

      {/* Default routes for unauthenticated users - This should always render if no other conditions match */}
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

      {/* Fallback route - This ensures something always renders */}
      <Route path="*" element={
        <LandingLayout>
          <LandingPage />
        </LandingLayout>
      } />
    </Routes>
  )
}

export default AppRoutes