import React from 'react'
import { motion } from 'framer-motion'
import { Box, Typography } from '@mui/material'

const CuisineFilter = ({ selectedCuisine, onCuisineChange }) => {
  const cuisines = [
    { 
      id: 'all', 
      label: 'All', 
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&h=200&fit=crop&crop=center'
    },
    { 
      id: 'Indian', 
      label: 'Indian', 
      image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=200&h=200&fit=crop&crop=center'
    },
    { 
      id: 'Chinese', 
      label: 'Chinese', 
      image: 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=200&h=200&fit=crop&crop=center'
    },
    { 
      id: 'Italian', 
      label: 'Italian', 
      image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=200&h=200&fit=crop&crop=center'
    },
    { 
      id: 'Mexican', 
      label: 'Mexican', 
      image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=200&h=200&fit=crop&crop=center'
    },
    { 
      id: 'American', 
      label: 'American', 
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop&crop=center'
    },
    { 
      id: 'Thai', 
      label: 'Thai', 
      image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=200&h=200&fit=crop&crop=center'
    },
    { 
      id: 'Japanese', 
      label: 'Japanese', 
      image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=200&h=200&fit=crop&crop=center'
    },
    { 
      id: 'Mediterranean', 
      label: 'Mediterranean', 
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200&h=200&fit=crop&crop=center'
    },
  ]

  return (
    <Box>
      <Typography 
        variant="h4" 
        component="h2" 
        sx={{ 
          mb: 4, 
          fontWeight: 700,
          fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
          textAlign: 'center'
        }}
      >
        What's on your mind?
      </Typography>
      
      <Box
        sx={{
          display: 'flex',
          gap: { xs: 2, sm: 3 },
          overflowX: 'auto',
          pb: 2,
          px: 1,
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
            whileHover={{ y: -8, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Box
              onClick={() => onCuisineChange(cuisine.id)}
              sx={{
                minWidth: { xs: 100, sm: 120 },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  '& .cuisine-image': {
                    boxShadow: selectedCuisine === cuisine.id 
                      ? '0 12px 32px rgba(249, 115, 22, 0.5)' 
                      : '0 8px 24px rgba(249, 115, 22, 0.3)',
                  },
                  '& .cuisine-label': {
                    color: 'primary.main',
                    fontWeight: 700,
                  }
                },
              }}
            >
              <Box
                className="cuisine-image"
                sx={{
                  width: { xs: 80, sm: 100 },
                  height: { xs: 80, sm: 100 },
                  borderRadius: '50%',
                  overflow: 'hidden',
                  mb: 2,
                  border: '4px solid',
                  borderColor: selectedCuisine === cuisine.id 
                    ? 'primary.main' 
                    : 'white',
                  boxShadow: selectedCuisine === cuisine.id 
                    ? '0 8px 24px rgba(249, 115, 22, 0.4)' 
                    : '0 4px 12px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  '&::after': selectedCuisine === cuisine.id ? {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(249, 115, 22, 0.2)',
                    borderRadius: '50%',
                  } : {},
                }}
              >
                <Box
                  component="img"
                  src={cuisine.image}
                  alt={cuisine.label}
                  onError={(e) => {
                    // Fallback to a solid color background with emoji if image fails
                    e.target.style.display = 'none';
                    e.target.parentElement.style.backgroundColor = '#f97316';
                    e.target.parentElement.style.display = 'flex';
                    e.target.parentElement.style.alignItems = 'center';
                    e.target.parentElement.style.justifyContent = 'center';
                    e.target.parentElement.innerHTML = `<span style="font-size: 2.5rem;">${
                      cuisine.id === 'all' ? '🍽️' :
                      cuisine.id === 'Indian' ? '🍛' :
                      cuisine.id === 'Chinese' ? '🥢' :
                      cuisine.id === 'Italian' ? '🍝' :
                      cuisine.id === 'Mexican' ? '🌮' :
                      cuisine.id === 'American' ? '🍔' :
                      cuisine.id === 'Thai' ? '🍜' :
                      cuisine.id === 'Japanese' ? '🍣' :
                      cuisine.id === 'Mediterranean' ? '🥙' : '🍽️'
                    }</span>`;
                  }}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'all 0.3s ease',
                    filter: selectedCuisine === cuisine.id 
                      ? 'brightness(1.1) saturate(1.2)' 
                      : 'brightness(1) saturate(1)',
                  }}
                />
              </Box>
              <Typography 
                className="cuisine-label"
                variant="body1" 
                sx={{ 
                  fontWeight: selectedCuisine === cuisine.id ? 700 : 600,
                  fontSize: { xs: '0.85rem', sm: '0.95rem' },
                  textAlign: 'center',
                  color: selectedCuisine === cuisine.id 
                    ? 'primary.main' 
                    : 'text.primary',
                  transition: 'all 0.3s ease',
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