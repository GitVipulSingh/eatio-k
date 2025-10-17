import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Alert, Container } from '@mui/material'

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useSelector(state => state.auth)
  const location = useLocation()

  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  // Check role-based access
  if (requiredRole && user?.role !== requiredRole) {
    // For admin routes, show access denied
    if (requiredRole === 'admin' || requiredRole === 'superadmin') {
      return (
        <Container maxWidth="sm" sx={{ py: 8 }}>
          <Alert severity="error">
            You don't have permission to access this page. Please contact support if you believe this is an error.
          </Alert>
        </Container>
      )
    }
    
    // For other protected routes, redirect to home
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute