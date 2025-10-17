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
import { ShoppingCartIcon, ArrowRightIcon } from '@heroicons/react/24/outline'

const EmptyCart = () => {
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper elevation={3} sx={{ p: 6, textAlign: 'center' }}>
          <motion.div
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, 2, -2, 0]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            <Box
              sx={{
                width: 120,
                height: 120,
                mx: 'auto',
                mb: 3,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 32px rgba(249, 115, 22, 0.3)',
              }}
            >
              <ShoppingCartIcon className="h-12 w-12 text-white" />
            </Box>
          </motion.div>

          <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 2 }}>
            Your cart is empty
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Looks like you haven't added any delicious items to your cart yet. 
            Start exploring our amazing restaurants and find something tasty!
          </Typography>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              component={Link}
              to="/"
              variant="contained"
              size="large"
              endIcon={<ArrowRightIcon className="h-4 w-4" />}
              sx={{ px: 4, py: 1.5 }}
            >
              Start Shopping
            </Button>
          </motion.div>

          <Box sx={{ mt: 4, p: 3, backgroundColor: 'grey.50', borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              💡 <strong>Tip:</strong> Browse restaurants by cuisine or search for your favorite dishes!
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, fontSize: '1.5rem' }}>
              🍕 🍔 🍜 🍛 🌮 🍣 🥗 🍰
            </Box>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  )
}

export default EmptyCart