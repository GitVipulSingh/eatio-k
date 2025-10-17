import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Container,
  Typography,
  Button,
  Box,
} from '@mui/material'
import { HomeIcon } from '@heroicons/react/24/outline'

const NotFoundPage = () => {
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box textAlign="center">
          <motion.div
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Box sx={{ position: 'relative', mb: 3 }}>
              <Typography
                variant="h1"
                sx={{
                  fontSize: '8rem',
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #f97316, #ea580c)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textAlign: 'center',
                }}
              >
                4🍕4
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  position: 'absolute',
                  bottom: -10,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  color: 'text.secondary',
                  fontSize: '1rem',
                }}
              >
                Page Not Found
              </Typography>
            </Box>
          </motion.div>

          <Typography variant="h4" component="h1" sx={{ mb: 2, fontWeight: 600 }}>
            Oops! This page got eaten! 🍽️
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Looks like this page is as missing as your favorite dish! 
            Don't worry, let's get you back to browsing delicious food.
          </Typography>

          <Box sx={{ mb: 4, fontSize: '2rem' }}>
            🍔 🍕 🍜 🌮 🍣 🥗
          </Box>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              component={Link}
              to="/"
              variant="contained"
              size="large"
              startIcon={<HomeIcon className="h-5 w-5" />}
              sx={{ px: 4, py: 1.5 }}
            >
              Back to Home
            </Button>
          </motion.div>
        </Box>
      </motion.div>
    </Container>
  )
}

export default NotFoundPage