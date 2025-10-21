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
    <Box>
      <Typography 
        variant="h5" 
        component="h2" 
        sx={{ 
          mb: 3, 
          fontWeight: 700,
          fontSize: { xs: '1.3rem', md: '1.5rem' }
        }}
      >
        What's on your mind?
      </Typography>
      
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          overflowX: 'auto',
          pb: 2,
          scrollBehavior: 'smooth',
          '&::-webkit-scrollbar': {
            height: 6,
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'grey.100',
            borderRadius: 3,
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'primary.main',
            borderRadius: 3,
            '&:hover': {
              backgroundColor: 'primary.dark',
            }
          },
        }}
      >
        {cuisines.map((cuisine, index) => (
          <motion.div
            key={cuisine.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.95 }}
          >
            <Box
              onClick={() => onCuisineChange(cuisine.id)}
              sx={{
                minWidth: 120,
                height: 100,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 3,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backgroundColor: selectedCuisine === cuisine.id 
                  ? 'primary.main' 
                  : 'white',
                color: selectedCuisine === cuisine.id 
                  ? 'white' 
                  : 'text.primary',
                border: '2px solid',
                borderColor: selectedCuisine === cuisine.id 
                  ? 'primary.main' 
                  : 'grey.200',
                boxShadow: selectedCuisine === cuisine.id 
                  ? '0 8px 24px rgba(249, 115, 22, 0.3)' 
                  : '0 2px 8px rgba(0,0,0,0.05)',
                '&:hover': {
                  borderColor: 'primary.main',
                  boxShadow: selectedCuisine === cuisine.id 
                    ? '0 12px 32px rgba(249, 115, 22, 0.4)' 
                    : '0 8px 24px rgba(249, 115, 22, 0.15)',
                  backgroundColor: selectedCuisine === cuisine.id 
                    ? 'primary.dark' 
                    : 'primary.light',
                  color: selectedCuisine === cuisine.id 
                    ? 'white' 
                    : 'primary.main',
                },
              }}
            >
              <Typography 
                variant="h4" 
                sx={{ 
                  mb: 1,
                  fontSize: '2rem',
                  filter: selectedCuisine === cuisine.id ? 'brightness(1.2)' : 'none'
                }}
              >
                {cuisine.emoji}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: selectedCuisine === cuisine.id ? 700 : 600,
                  fontSize: '0.9rem',
                  textAlign: 'center',
                }}
              >
                {cuisine.label}
              </Typography>
            </Box>
          </motion.div>
        ))}
      </Box>
    </Box>
  )
}

export default CuisineFilter