import React from 'react'
import { motion } from 'framer-motion'
import { Box, Typography } from '@mui/material'

const LoadingSpinner = ({ message = 'Loading...', size = 40, fullScreen = false }) => {
  const content = (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight={fullScreen ? "100vh" : "200px"}
      gap={3}
      sx={{
        background: fullScreen ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' : 'transparent',
        color: fullScreen ? 'white' : 'inherit',
      }}
    >
      <motion.div
        animate={{ 
          rotate: 360,
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
          scale: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
        }}
      >
        <Box
          sx={{
            width: size * 1.5,
            height: size * 1.5,
            borderRadius: '50%',
            background: fullScreen 
              ? 'rgba(255, 255, 255, 0.2)' 
              : 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: fullScreen 
              ? '0 8px 32px rgba(255, 255, 255, 0.2)' 
              : '0 8px 32px rgba(249, 115, 22, 0.3)',
          }}
        >
          <Typography variant="h4" sx={{ fontSize: size / 2 }}>
            🍕
          </Typography>
        </Box>
      </motion.div>
      
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Typography 
          variant="body1" 
          sx={{ 
            fontWeight: 500,
            color: fullScreen ? 'rgba(255, 255, 255, 0.9)' : 'text.secondary'
          }}
        >
          {message}
        </Typography>
      </motion.div>

      {fullScreen && (
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Box sx={{ display: 'flex', gap: 1, fontSize: '1.5rem', mt: 2 }}>
            🍔 🍜 🌮 🍣 🥗 🍰
          </Box>
        </motion.div>
      )}
    </Box>
  )

  return content
}

export default LoadingSpinner