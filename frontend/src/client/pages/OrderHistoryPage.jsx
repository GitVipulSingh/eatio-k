import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Avatar,
  Divider,
  Alert,
  Skeleton,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
} from '@mui/material'
import {
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
  MapPinIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline'
import { format } from 'date-fns'

import { useOrderHistory } from '../api/queries'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const OrderHistoryPage = () => {
  const navigate = useNavigate()
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false)

  const { data: orders, isLoading, error } = useOrderHistory()

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'warning',
      'Confirmed': 'info',
      'Preparing': 'primary',
      'Out for Delivery': 'secondary',
      'Delivered': 'success',
      'Cancelled': 'error'
    }
    return colors[status] || 'default'
  }

  const getStatusIcon = (status) => {
    const icons = {
      'Pending': <ClockIcon className="h-4 w-4" />,
      'Confirmed': <CheckCircleIcon className="h-4 w-4" />,
      'Preparing': <ClockIcon className="h-4 w-4" />,
      'Out for Delivery': <TruckIcon className="h-4 w-4" />,
      'Delivered': <CheckCircleIcon className="h-4 w-4" />,
      'Cancelled': <ClockIcon className="h-4 w-4" />
    }
    return icons[status] || <ClockIcon className="h-4 w-4" />
  }

  const getOrderSteps = (status) => {
    const allSteps = [
      'Pending',
      'Confirmed', 
      'Preparing',
      'Out for Delivery',
      'Delivered'
    ]
    
    const currentIndex = allSteps.indexOf(status)
    return allSteps.map((step, index) => ({
      label: step,
      completed: index <= currentIndex,
      active: index === currentIndex
    }))
  }

  const handleTrackOrder = (order) => {
    setSelectedOrder(order)
    setTrackingDialogOpen(true)
  }

  const handleReorder = (order) => {
    // Navigate to restaurant and add items to cart
    navigate(`/restaurants/${order.restaurant._id}`)
  }

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ mb: 4 }}>Order History</Typography>
        <Grid container spacing={3}>
          {[...Array(3)].map((_, index) => (
            <Grid item xs={12} key={index}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" height={32} width="40%" />
                  <Skeleton variant="text" height={24} width="60%" />
                  <Skeleton variant="text" height={24} width="30%" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Failed to load order history. Please try again later.
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
            Order History
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track your orders and reorder your favorites
          </Typography>
        </Box>

        {!orders || orders.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Box sx={{ fontSize: '4rem', mb: 2 }}>🍽️</Box>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
              No orders yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              When you place your first order, it will appear here.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/')}
            >
              Start Ordering
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {orders.map((order, index) => (
              <Grid item xs={12} key={order._id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card sx={{ '&:hover': { boxShadow: 4 } }}>
                    <CardContent sx={{ p: 2 }}>
                      {/* Header Row */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar
                            src={`https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80`}
                            alt={order.restaurant?.name}
                            sx={{ width: 40, height: 40 }}
                          >
                            🍽️
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                              {order.restaurant?.name || 'Restaurant'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              #{order._id.slice(-8).toUpperCase()} • {format(new Date(order.createdAt), 'MMM dd, hh:mm a')}
                            </Typography>
                          </Box>
                        </Box>
                        <Chip
                          icon={getStatusIcon(order.status)}
                          label={order.status}
                          color={getStatusColor(order.status)}
                          size="small"
                          variant="outlined"
                        />
                      </Box>

                      {/* Items Summary */}
                      <Box sx={{ mb: 1.5 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          {order.items?.slice(0, 2).map((item, idx) => (
                            <span key={idx}>
                              {item.quantity}x {item.name}
                              {idx < Math.min(order.items.length, 2) - 1 ? ', ' : ''}
                            </span>
                          ))}
                          {order.items?.length > 2 && (
                            <span> +{order.items.length - 2} more</span>
                          )}
                        </Typography>
                      </Box>

                      {/* Bottom Row */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                            ₹{order.totalAmount}
                          </Typography>
                          {order.deliveryAddress && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <MapPinIcon className="h-3 w-3 text-gray-500" />
                              <Typography variant="caption" color="text.secondary">
                                {order.deliveryAddress.city}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handleTrackOrder(order)}
                              sx={{ minWidth: 'auto', px: 1.5 }}
                            >
                              Track
                            </Button>
                          )}
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleReorder(order)}
                            sx={{ minWidth: 'auto', px: 1.5 }}
                          >
                            Reorder
                          </Button>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Order Tracking Dialog */}
        <Dialog
          open={trackingDialogOpen}
          onClose={() => setTrackingDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Track Order #{selectedOrder?._id.slice(-8).toUpperCase()}
          </DialogTitle>
          <DialogContent>
            {selectedOrder && (
              <Box>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    {selectedOrder.restaurant?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Estimated delivery: 30-45 minutes
                  </Typography>
                </Box>

                <Stepper orientation="vertical" activeStep={getOrderSteps(selectedOrder.status).findIndex(step => step.active)}>
                  {getOrderSteps(selectedOrder.status).map((step, index) => (
                    <Step key={step.label} completed={step.completed}>
                      <StepLabel>
                        <Typography variant="body1" sx={{ fontWeight: step.active ? 600 : 400 }}>
                          {step.label}
                        </Typography>
                      </StepLabel>
                      <StepContent>
                        <Typography variant="body2" color="text.secondary">
                          {step.label === 'Pending' && 'Your order has been placed and is being processed.'}
                          {step.label === 'Confirmed' && 'Restaurant has confirmed your order.'}
                          {step.label === 'Preparing' && 'Your delicious food is being prepared.'}
                          {step.label === 'Out for Delivery' && 'Your order is on the way!'}
                          {step.label === 'Delivered' && 'Your order has been delivered. Enjoy your meal!'}
                        </Typography>
                      </StepContent>
                    </Step>
                  ))}
                </Stepper>

                {selectedOrder.deliveryAddress && (
                  <Box sx={{ mt: 3, p: 2, backgroundColor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      Delivery Address:
                    </Typography>
                    <Typography variant="body2">
                      {selectedOrder.deliveryAddress.street}<br />
                      {selectedOrder.deliveryAddress.city} - {selectedOrder.deliveryAddress.pincode}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTrackingDialogOpen(false)}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </motion.div>
    </Container>
  )
}

export default OrderHistoryPage