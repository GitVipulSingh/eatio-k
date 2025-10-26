import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  IconButton,
  Divider,
  Grid,
  Paper,
  Alert,
} from '@mui/material'
import {
  PlusIcon,
  MinusIcon,
  TrashIcon,
  ShoppingBagIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline'

import { updateQuantity, removeFromCart, clearCart } from '../store/slices/cartSlice'
import EmptyCart from '../components/cart/EmptyCart'

const CartPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { items, totalAmount, totalItems, deliveryFee, taxRate } = useSelector(state => state.cart)

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      dispatch(removeFromCart(itemId))
    } else {
      dispatch(updateQuantity({ itemId, quantity: newQuantity }))
    }
  }

  const handleRemoveItem = (itemId) => {
    dispatch(removeFromCart(itemId))
  }

  const handleClearCart = () => {
    dispatch(clearCart())
  }

  const subtotal = items.reduce((total, item) => total + item.totalPrice, 0)
  const tax = subtotal * taxRate
  const finalTotal = subtotal + tax + (subtotal > 0 ? deliveryFee : 0)

  if (items.length === 0) {
    return <EmptyCart />
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <IconButton
            onClick={() => navigate(-1)}
            sx={{ mr: 2 }}
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </IconButton>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            Your Cart ({totalItems} items)
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Cart Items */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent sx={{ p: 0 }}>
                {/* Clear Cart Button */}
                <Box sx={{ p: 3, pb: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Order Items
                  </Typography>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={handleClearCart}
                    startIcon={<TrashIcon className="h-4 w-4" />}
                  >
                    Clear Cart
                  </Button>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Cart Items List */}
                <AnimatePresence>
                  {items.map((item, index) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Box sx={{ p: 3, borderBottom: index < items.length - 1 ? 1 : 0, borderColor: 'divider' }}>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} sm={6}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                              {item.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {item.description}
                            </Typography>
                            <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600 }}>
                              ₹{item.price} each
                            </Typography>
                          </Grid>

                          <Grid item xs={12} sm={3}>
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              backgroundColor: 'white',
                              border: '2px solid',
                              borderColor: 'primary.main',
                              borderRadius: 2,
                              overflow: 'hidden',
                              width: 'fit-content'
                            }}>
                              <Button
                                size="small"
                                onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                                sx={{ 
                                  minWidth: 40,
                                  height: 40,
                                  borderRadius: 0,
                                  backgroundColor: 'primary.main',
                                  color: 'white',
                                  fontWeight: 700,
                                  fontSize: '1.2rem',
                                  '&:hover': { 
                                    backgroundColor: 'primary.dark'
                                  }
                                }}
                              >
                                −
                              </Button>
                              
                              <Typography 
                                sx={{ 
                                  minWidth: 50, 
                                  textAlign: 'center',
                                  fontWeight: 700,
                                  color: 'primary.main',
                                  py: 1,
                                  backgroundColor: 'primary.light',
                                  fontSize: '1rem',
                                }}
                              >
                                {item.quantity}
                              </Typography>
                              
                              <Button
                                size="small"
                                onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                                sx={{ 
                                  minWidth: 40,
                                  height: 40,
                                  borderRadius: 0,
                                  backgroundColor: 'primary.main',
                                  color: 'white',
                                  fontWeight: 700,
                                  fontSize: '1.2rem',
                                  '&:hover': { 
                                    backgroundColor: 'primary.dark'
                                  }
                                }}
                              >
                                +
                              </Button>
                            </Box>
                          </Grid>

                          <Grid item xs={12} sm={2}>
                            <Typography variant="h6" sx={{ fontWeight: 600, textAlign: 'center' }}>
                              ₹{item.totalPrice}
                            </Typography>
                          </Grid>

                          <Grid item xs={12} sm={1}>
                            <IconButton
                              color="error"
                              onClick={() => handleRemoveItem(item._id)}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </IconButton>
                          </Grid>
                        </Grid>
                      </Box>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </CardContent>
            </Card>
          </Grid>

          {/* Order Summary */}
          <Grid item xs={12} md={4}>
            <Card sx={{ position: 'sticky', top: 20 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Order Summary
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Subtotal ({totalItems} items)</Typography>
                    <Typography variant="body2">₹{subtotal.toFixed(2)}</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Delivery Fee</Typography>
                    <Typography variant="body2">₹{deliveryFee}</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Taxes & Fees</Typography>
                    <Typography variant="body2">₹{tax.toFixed(2)}</Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Total
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    ₹{finalTotal.toFixed(2)}
                  </Typography>
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/checkout')}
                  startIcon={<ShoppingBagIcon className="h-5 w-5" />}
                  sx={{ mb: 2 }}
                >
                  Proceed to Checkout
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  component={Link}
                  to="/"
                  startIcon={<ArrowLeftIcon className="h-4 w-4" />}
                >
                  Continue Shopping
                </Button>
              </CardContent>
            </Card>

            {/* Delivery Info */}
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                🚚 Free delivery on orders above ₹199
              </Typography>
            </Alert>
          </Grid>
        </Grid>
      </motion.div>
    </Container>
  )
}

export default CartPage