import React from 'react'
import { motion } from 'framer-motion'
import { Box, Chip, Typography } from '@mui/material'

const CuisineFilter = ({ selectedCuisine, onCuisineChange }) => {
  const cuisines = [
    { id: 'all', label: 'All', emoji: '🍽️' },
    { id: 'Indian', label: 'Indian', emoji: '🍛' },
    { id: 'Chinese', label: 'Chinese', emoji: '🥢' },
    { id: 'Italian', label: 'Italian', emoji: '🍝' },
    { id: 'Mexican', label: 'Mexican', emoji: '🌮' },
    { id: 'American', label: 'American', emoji: '🍔' },
    { id: 'Thai', label: 'Thai', emoji: '🍜' },
    { id: 'Japanese', label: 'Japanese', emoji: '🍣' },
    { id: 'Mediterranean', label: 'Mediterranean', emoji: '🥙' },
  ]

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
        Browse by Cuisine
      </Typography>
      
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          flexWrap: 'wrap',
          overflowX: 'auto',
          pb: 1,
          '&::-webkit-scrollbar': {
            height: 4,
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'primary.main',
            borderRadius: 2,
          },
        }}
      >
        {cuisines.map((cuisine, index) => (
          <motion.div
            key={cuisine.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Chip
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <span>{cuisine.emoji}</span>
                  <span>{cuisine.label}</span>
                </Box>
              }
              onClick={() => onCuisineChange(cuisine.id)}
              variant={selectedCuisine === cuisine.id ? 'filled' : 'outlined'}
              color={selectedCuisine === cuisine.id ? 'primary' : 'default'}
              sx={{
                fontWeight: selectedCuisine === cuisine.id ? 600 : 400,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: selectedCuisine === cuisine.id 
                    ? 'primary.dark' 
                    : 'primary.light',
                  color: 'white',
                },
              }}
            />
          </motion.div>
        ))}
      </Box>
    </Box>
  )
}

export default CuisineFilter