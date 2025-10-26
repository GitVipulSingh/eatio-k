// Error boundary specifically for registration pages
import React from 'react'
import { Alert, Box, Button, Typography } from '@mui/material'

class RegistrationErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // Log the error
    console.error('🚨 Registration Error Boundary caught an error:', error, errorInfo)
    
    // Check if it's a socket-related error
    if (error.message && error.message.includes('socket')) {
      console.log('🔌 Socket-related error detected in registration')
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          p: 3
        }}>
          <Alert 
            severity="error" 
            sx={{ maxWidth: 500 }}
            action={
              <Button 
                color="inherit" 
                size="small"
                onClick={() => {
                  this.setState({ hasError: false, error: null })
                  window.location.reload()
                }}
              >
                Reload Page
              </Button>
            }
          >
            <Typography variant="h6" sx={{ mb: 1 }}>
              Registration Error
            </Typography>
            <Typography variant="body2">
              Something went wrong during registration. Please try reloading the page.
            </Typography>
            {this.state.error && (
              <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.7 }}>
                Error: {this.state.error.message}
              </Typography>
            )}
          </Alert>
        </Box>
      )
    }

    return this.props.children
  }
}

export default RegistrationErrorBoundary