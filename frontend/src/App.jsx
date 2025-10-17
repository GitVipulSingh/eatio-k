import React, { useEffect } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'

// Common components
import LoadingSpinner from './common/components/LoadingSpinner'

// Centralized routing
import AppRoutes from './routes'

// Hooks
import { useUserProfile } from './client/api/queries'
import { loginSuccess, logout } from './client/store/slices/authSlice'

function App() {
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector(state => state.auth)
  
  // Only fetch user profile if we have stored user info (indicating previous authentication)
  const hasStoredAuth = !!localStorage.getItem('userInfo')
  const { data: userData, isLoading, error } = useUserProfile({
    enabled: hasStoredAuth && !isAuthenticated // Only run if we have stored auth but aren't authenticated yet
  })

  useEffect(() => {
    if (userData && !isAuthenticated) {
      dispatch(loginSuccess({ user: userData }))
    }
  }, [userData, dispatch, isAuthenticated])

  // Handle authentication errors
  useEffect(() => {
    if (error?.response?.status === 401) {
      dispatch(logout())
    }
  }, [error, dispatch])

  // Show loading only if we're checking authentication and user should be logged in
  if (isLoading && hasStoredAuth) {
    return <LoadingSpinner message="Welcome to Eatio! 🍕" fullScreen={true} />
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <AppRoutes />
          </motion.div>
        </AnimatePresence>
      </div>
    </Router>
  )
}

export default App