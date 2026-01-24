import React from 'react'
import { Link } from 'react-router-dom'
import { Container, Typography, Button, Box } from '@mui/material'
import { HomeIcon } from '@heroicons/react/24/outline'

const NotFoundPage = () => {
  return (
    <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h1" sx={{ fontSize: '6rem', fontWeight: 'bold', color: 'primary.main' }}>
          404
        </Typography>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
          Page Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          The page you're looking for doesn't exist or has been moved.
        </Typography>
      </Box>
      
      <Button
        component={Link}
        to="/"
        variant="contained"
        size="large"
        startIcon={<HomeIcon style={{ width: '20px', height: '20px' }} />}
        sx={{ 
          px: 4,
          py: 1.5,
          borderRadius: 3,
          fontWeight: 600
        }}
      >
        Go Home
      </Button>
    </Container>
  )
}

export default NotFoundPage