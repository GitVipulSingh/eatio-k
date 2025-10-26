// Component to handle API errors gracefully
import { Alert, Box, Button, Typography } from '@mui/material'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

const ApiErrorHandler = ({ error, onRetry, title = "Something went wrong" }) => {
  const getErrorMessage = (error) => {
    if (error?.response?.status === 403) {
      return "You don't have permission to access this resource. Please check your login credentials."
    }
    if (error?.response?.status === 401) {
      return "Your session has expired. Please log in again."
    }
    if (error?.response?.status >= 500) {
      return "Server error occurred. Please try again later."
    }
    if (error?.response?.data?.message) {
      return error.response.data.message
    }
    if (error?.message) {
      return error.message
    }
    return "An unexpected error occurred. Please try again."
  }

  const getErrorColor = (error) => {
    if (error?.response?.status === 403 || error?.response?.status === 401) {
      return 'warning'
    }
    return 'error'
  }

  return (
    <Box sx={{ p: 3, textAlign: 'center' }}>
      <Box sx={{ 
        width: 60, 
        height: 60, 
        borderRadius: '50%', 
        backgroundColor: `${getErrorColor(error)}.light`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mx: 'auto',
        mb: 2
      }}>
        <ExclamationTriangleIcon className="h-6 w-6" />
      </Box>
      
      <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
        {title}
      </Typography>
      
      <Alert severity={getErrorColor(error)} sx={{ mb: 2, textAlign: 'left' }}>
        {getErrorMessage(error)}
      </Alert>
      
      {onRetry && (
        <Button variant="outlined" onClick={onRetry}>
          Try Again
        </Button>
      )}
      
      {error?.response?.status === 403 && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
          If you believe you should have access, please contact your administrator.
        </Typography>
      )}
    </Box>
  )
}

export default ApiErrorHandler