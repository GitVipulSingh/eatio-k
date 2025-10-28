import React, { useEffect } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'

// Common components
import LoadingSpinner from './common/components/LoadingSpinner'
import ScrollToTop from './components/ScrollToTop'

// Centralized routing
import AppRoutes from './routes'

// Contexts
import ConditionalSocketProvider from './components/ConditionalSocketProvider'

// Hooks
import { useUserProfile } from './client/api/queries'
import { loginSuccess, logout } from './client/store/slices/authSlice'

function App() {
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector(state => state.auth)
  
  // Disable browser's automatic scroll restoration
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
  }, [])
  
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
      <ScrollToTop />
      <ConditionalSocketProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: 0.2,
                ease: "easeOut"
              }}
              style={{
                willChange: 'opacity',
                backfaceVisibility: 'hidden'
              }}
            >
              <AppRoutes />
            </motion.div>
          </AnimatePresence>
        </div>
      </ConditionalSocketProvider>
    </Router>
  )
}

export default App