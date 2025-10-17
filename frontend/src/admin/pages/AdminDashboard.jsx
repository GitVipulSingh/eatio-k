import React from 'react'
import { Typography, Box } from '@mui/material'

const AdminDashboard = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Admin Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Welcome to the admin dashboard. This will be populated with admin-specific content.
      </Typography>
    </Box>
  )
}

export default AdminDashboard