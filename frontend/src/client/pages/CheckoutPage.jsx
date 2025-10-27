import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Divider,
  Alert,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
} from '@mui/material'
import {
  PlusIcon,
  MapPinIcon,
  CreditCardIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

import { useCreateOrder, useCreatePayment, useVerifyPayment } from '../api/queries'
import { clearCart } from '../store/slices/cartSlice'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const CheckoutPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { items, totalAmount, deliveryFee, taxRate, restaurantId } = useSelector(state => state.cart)
  const { user } = useSelector(state => state.auth)
  
  const [selectedAddress, setSelectedAddress] = useState(0)
  const [addressDialog, setAddressDialog] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('razorpay')
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      type: 'Home',
      street: '123 Main Street',
      city: 'Mumbai',
      pincode: '400001',
      isDefault: true
    }
  ])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm()

  const createOrderMutation = useCreateOrder()
  const createPaymentMutation = useCreatePayment()
  const verifyPaymentMutation = useVerifyPayment()

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart')
    }
  }, [items, navigate])

  const subtotal = items.reduce((total, item) => total + item.totalPrice, 0)
  const tax = subtotal * taxRate
  const finalTotal = subtotal + tax + deliveryFee

  const handleAddAddress = (data) => {
    const newAddress = {
      id: addresses.length + 1,
      type: data.type || 'Other',
      street: data.street,
      city: data.city,
      pincode: data.pincode,
      isDefault: false
    }
    setAddresses([...addresses, newAddress])
    setSelectedAddress(addresses.length)
    setAddressDialog(false)
    reset()
    toast.success('Address added successfully')
  }

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handlePayment = async () => {
    try {
      if (paymentMethod === 'cod') {
        // Cash on Delivery - Create order directly
        const orderData = {
          restaurantId: restaurantId,
          items: items.map(item => ({
            menuItemId: item._id,
            quantity: item.quantity
          })),
          totalAmount: finalTotal,
          deliveryAddress: addresses[selectedAddress]
        }

        await createOrderMutation.mutateAsync(orderData)
        dispatch(clearCart())
        navigate('/profile/orders')
        toast.success('Order placed successfully! Check your order status in order history.')
        return
      }

      // Razorpay Payment - Don't create order yet, only create payment order
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        toast.error('Razorpay SDK failed to load')
        return
      }

      // Create Razorpay order (no backend order creation yet)
      const paymentOrder = await createPaymentMutation.mutateAsync({
        amount: finalTotal
      })

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: paymentOrder.amount,
        currency: 'INR',
        name: 'Eatio',
        description: 'Food Order Payment',
        order_id: paymentOrder.id,
        handler: async (response) => {
          try {
            // Verify payment and create order in one step
            await verifyPaymentMutation.mutateAsync({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderItems: items.map(item => ({
                name: item.name,
                price: item.price,
                quantity: item.quantity
              })),
              restaurantId: restaurantId,
              deliveryAddress: addresses[selectedAddress],
              totalAmount: finalTotal
            })

            dispatch(clearCart())
            navigate('/profile/orders')
            toast.success('Payment successful! Check your order status in order history.')
          } catch (error) {
            toast.error('Payment verification failed')
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.phone
        },
        theme: {
          color: '#f97316'
        }
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error) {
      toast.error('Failed to process order')
    }
  }

  if (items.length === 0) {
    return <LoadingSpinner message="Redirecting to cart..." />
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
          <IconButton onClick={() => navigate('/cart')} sx={{ mr: 2 }}>
            <ArrowLeftIcon className="h-5 w-5" />
          </IconButton>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            Checkout
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Left Column - Address & Payment */}
          <Grid item xs={12} md={8}>
            {/* Delivery Address */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Delivery Address
                  </Typography>
                  <Button
                    startIcon={<PlusIcon className="h-4 w-4" />}
                    onClick={() => setAddressDialog(true)}
                  >
                    Add New Address
                  </Button>
                </Box>

                <RadioGroup
                  value={selectedAddress}
                  onChange={(e) => setSelectedAddress(parseInt(e.target.value))}
                >
                  {addresses.map((address, index) => (
                    <Card
                      key={address.id}
                      variant="outlined"
                      sx={{
                        mb: 2,
                        border: selectedAddress === index ? 2 : 1,
                        borderColor: selectedAddress === index ? 'primary.main' : 'divider'
                      }}
                    >
                      <CardContent sx={{ py: 2 }}>
                        <FormControlLabel
                          value={index}
                          control={<Radio />}
                          label={
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <MapPinIcon className="h-4 w-4" />
                                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                                  {address.type}
                                </Typography>
                                {address.isDefault && (
                                  <Typography variant="caption" color="primary">
                                    (Default)
                                  </Typography>
                                )}
                              </Box>
                              <Typography variant="body2" color="text.secondary">
                                {address.street}, {address.city} - {address.pincode}
                              </Typography>
                            </Box>
                          }
                        />
                      </CardContent>
                    </Card>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Payment Method
                </Typography>

                <FormControl component="fieldset">
                  <RadioGroup
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <Card variant="outlined" sx={{ mb: 2, p: 2 }}>
                      <FormControlLabel
                        value="razorpay"
                        control={<Radio />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CreditCardIcon className="h-5 w-5" />
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                Pay Online
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Credit/Debit Card, UPI, Net Banking
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                    </Card>

                    <Card variant="outlined" sx={{ p: 2 }}>
                      <FormControlLabel
                        value="cod"
                        control={<Radio />}
                        label={
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              Cash on Delivery
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Pay when your order arrives
                            </Typography>
                          </Box>
                        }
                      />
                    </Card>
                  </RadioGroup>
                </FormControl>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column - Order Summary */}
          <Grid item xs={12} md={4}>
            <Card sx={{ position: 'sticky', top: 20 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Order Summary
                </Typography>

                {/* Order Items */}
                <Box sx={{ mb: 3 }}>
                  {items.map((item) => (
                    <Box
                      key={item._id}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 2
                      }}
                    >
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {item.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Qty: {item.quantity} × ₹{item.price}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        ₹{item.totalPrice}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* Bill Details */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Subtotal</Typography>
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

                <Divider sx={{ mb: 2 }} />

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
                  onClick={handlePayment}
                  disabled={createOrderMutation.isPending || createPaymentMutation.isPending}
                  sx={{ py: 1.5 }}
                >
                  {createOrderMutation.isPending || createPaymentMutation.isPending ? (
                    <LoadingSpinner size={24} />
                  ) : paymentMethod === 'cod' ? (
                    'Place Order'
                  ) : (
                    'Proceed to Payment'
                  )}
                </Button>

                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    By placing this order, you agree to our terms and conditions.
                  </Typography>
                </Alert>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Add Address Dialog */}
        <Dialog
          open={addressDialog}
          onClose={() => setAddressDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Add New Address</DialogTitle>
          <form onSubmit={handleSubmit(handleAddAddress)}>
            <DialogContent>
              <Grid container spacing={2} sx={{ pt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address Type"
                    placeholder="e.g., Home, Office, Other"
                    {...register('type')}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Street Address"
                    {...register('street', { required: 'Street address is required' })}
                    error={!!errors.street}
                    helperText={errors.street?.message}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="City"
                    {...register('city', { required: 'City is required' })}
                    error={!!errors.city}
                    helperText={errors.city?.message}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Pincode"
                    {...register('pincode', {
                      required: 'Pincode is required',
                      pattern: {
                        value: /^[0-9]{6}$/,
                        message: 'Please enter a valid 6-digit pincode'
                      }
                    })}
                    error={!!errors.pincode}
                    helperText={errors.pincode?.message}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setAddressDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="contained">
                Add Address
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </motion.div>
    </Container>
  )
}

export default CheckoutPage