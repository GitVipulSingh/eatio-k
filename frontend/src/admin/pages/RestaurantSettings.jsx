import React from 'react'
import { Typography, Box } from '@mui/material'

const RestaurantSettings = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Restaurant Settings
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Configure your restaurant settings and preferences here.
      </Typography>
    </Box>
  )
}

export default RestaurantSettings