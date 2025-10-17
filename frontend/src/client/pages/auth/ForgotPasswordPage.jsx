import React from 'react'
import { Container, Typography, Box } from '@mui/material'

const ForgotPasswordPage = () => {
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Box textAlign="center">
        <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
          Forgot Password
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Password reset form will be implemented here
        </Typography>
      </Box>
    </Container>
  )
}

export default ForgotPasswordPage