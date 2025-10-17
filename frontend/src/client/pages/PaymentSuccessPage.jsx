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
import { CheckCircleIcon, HomeIcon, ClockIcon } from '@heroicons/react/24/outline'

const PaymentSuccessPage = () => {
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
          </motion.div>

          <Typography variant="h4" component="h1" sx={{ mb: 2, fontWeight: 600 }}>
            Payment Successful!
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Thank you for your order. Your food is being prepared and will be delivered soon.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              component={Link}
              to="/order-history"
              variant="contained"
              startIcon={<ClockIcon className="h-4 w-4" />}
            >
              Track Order
            </Button>
            
            <Button
              component={Link}
              to="/"
              variant="outlined"
              startIcon={<HomeIcon className="h-4 w-4" />}
            >
              Continue Shopping
            </Button>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  )
}

export default PaymentSuccessPage