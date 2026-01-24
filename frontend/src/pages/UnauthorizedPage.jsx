import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
} from '@mui/material'
import {
  ExclamationTriangleIcon,
  HomeIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline'

const UnauthorizedPage = () => {
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper elevation={3} sx={{ p: 6, textAlign: 'center' }}>
          <Box sx={{ mb: 4 }}>
            <ExclamationTriangleIcon 
              style={{ width: '64px', height: '64px', color: '#f97316', margin: '0 auto 16px', display: 'block' }}
            />
            <Typography variant="h3" sx={{ fontWeight: 600, mb: 2 }}>
              403
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              Access Denied
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              You don't have permission to access this page. Please check your account role or contact support if you believe this is an error.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              component={Link}
              to="/"
              variant="contained"
              startIcon={<HomeIcon style={{ width: '16px', height: '16px' }} />}
            >
              Go Home
            </Button>
            <Button
              onClick={() => window.history.back()}
              variant="outlined"
              startIcon={<ArrowLeftIcon style={{ width: '16px', height: '16px' }} />}
            >
              Go Back
            </Button>
          </Box>

          <Box sx={{ mt: 4, p: 2, backgroundColor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Need help?</strong> Contact our support team if you believe you should have access to this page.
            </Typography>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  )
}

export default UnauthorizedPage