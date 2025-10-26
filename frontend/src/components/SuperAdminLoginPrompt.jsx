// Component to prompt users to login as superadmin
import { Alert, Box, Button, Typography, Card, CardContent } from '@mui/material'
import { Link } from 'react-router-dom'
import { ShieldExclamationIcon } from '@heroicons/react/24/outline'

const SuperAdminLoginPrompt = () => {
  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      p: 3,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Card sx={{ maxWidth: 500, width: '100%' }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Box sx={{ 
            width: 80, 
            height: 80, 
            borderRadius: '50%', 
            backgroundColor: 'error.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 3
          }}>
            <ShieldExclamationIcon className="h-10 w-10 text-white" />
          </Box>
          
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: 'error.main' }}>
            Super Admin Access Required
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            You need to be logged in as a Super Admin to access this dashboard.
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Super Admin Credentials:</strong>
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
              Email: superadmin@gmail.com<br />
              (Use the existing superadmin account)
            </Typography>
          </Alert>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              component={Link}
              to="/auth/login"
              variant="contained"
              color="primary"
              size="large"
              sx={{ px: 4 }}
            >
              Login as Super Admin
            </Button>
            <Button
              component={Link}
              to="/"
              variant="outlined"
              size="large"
              sx={{ px: 4 }}
            >
              Go to Home
            </Button>
          </Box>
          
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 3 }}>
            If you're having trouble accessing the Super Admin account, please contact the system administrator.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}

export default SuperAdminLoginPrompt