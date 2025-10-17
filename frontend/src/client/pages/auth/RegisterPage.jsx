import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Divider,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
} from '@mui/material'
import {
  UserIcon,
  BuildingStorefrontIcon,
  DocumentIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

import { useRegister } from '../../api/queries'
import { loginSuccess } from '../../store/slices/authSlice'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

const RegisterPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  
  const isRestaurant = location.pathname.includes('/admin')
  const [activeStep, setActiveStep] = useState(0)
  const [selectedCuisines, setSelectedCuisines] = useState([])
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm()

  const registerMutation = useRegister()

  const cuisineOptions = [
    'Indian', 'Chinese', 'Italian', 'Mexican', 'American', 
    'Thai', 'Japanese', 'Mediterranean', 'Korean', 'French'
  ]

  const customerSteps = ['Personal Info', 'Account Setup']
  const restaurantSteps = ['Personal Info', 'Restaurant Details', 'Documents', 'Review']

  const steps = isRestaurant ? restaurantSteps : customerSteps

  const handleCuisineChange = (event) => {
    const value = event.target.value
    setSelectedCuisines(typeof value === 'string' ? value.split(',') : value)
    setValue('cuisine', typeof value === 'string' ? value.split(',') : value)
  }

  const onSubmit = async (data) => {
    try {
      const formData = {
        ...data,
        role: isRestaurant ? 'admin' : 'customer',
      }

      if (isRestaurant) {
        formData.restaurantDetails = {
          restaurantName: data.restaurantName,
          address: {
            street: data.street,
            city: data.city,
            pincode: data.pincode,
          },
          cuisine: selectedCuisines,
          fssaiLicenseNumber: data.fssaiLicenseNumber,
          gstNumber: data.gstNumber,
          documents: {
            fssaiLicenseUrl: data.fssaiLicenseUrl,
            shopEstablishmentUrl: data.shopEstablishmentUrl,
            gstCertificateUrl: data.gstCertificateUrl,
            ownerPhotoUrl: data.ownerPhotoUrl,
          }
        }
      }

      const result = await registerMutation.mutateAsync(formData)
      dispatch(loginSuccess({ user: result }))
      
      if (isRestaurant) {
        toast.success('Restaurant registration submitted! Awaiting approval.')
        navigate('/restaurant-dashboard')
      } else {
        toast.success('Registration successful!')
        navigate('/')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed')
    }
  }

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1)
  }

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1)
  }

  const renderStepContent = (step) => {
    if (!isRestaurant) {
      // Customer Registration
      return (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Full Name"
              {...register('name', { required: 'Name is required' })}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone Number"
              {...register('phone', { 
                required: 'Phone is required',
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: 'Please enter a valid 10-digit phone number'
                }
              })}
              error={!!errors.phone}
              helperText={errors.phone?.message}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'Invalid email address',
                },
              })}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Password"
              type="password"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
              error={!!errors.password}
              helperText={errors.password?.message}
            />
          </Grid>
        </Grid>
      )
    }

    // Restaurant Registration Steps
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Owner Name"
                {...register('name', { required: 'Name is required' })}
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                {...register('phone', { 
                  required: 'Phone is required',
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: 'Please enter a valid 10-digit phone number'
                  }
                })}
                error={!!errors.phone}
                helperText={errors.phone?.message}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Invalid email address',
                  },
                })}
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
                error={!!errors.password}
                helperText={errors.password?.message}
              />
            </Grid>
          </Grid>
        )

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Restaurant Name"
                {...register('restaurantName', { required: 'Restaurant name is required' })}
                error={!!errors.restaurantName}
                helperText={errors.restaurantName?.message}
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
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Cuisine Types</InputLabel>
                <Select
                  multiple
                  value={selectedCuisines}
                  onChange={handleCuisineChange}
                  input={<OutlinedInput label="Cuisine Types" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {cuisineOptions.map((cuisine) => (
                    <MenuItem key={cuisine} value={cuisine}>
                      {cuisine}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        )

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 2 }}>
                Please provide the following documents for verification. All fields are required for approval.
              </Alert>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="FSSAI License Number"
                {...register('fssaiLicenseNumber', { required: 'FSSAI License is required' })}
                error={!!errors.fssaiLicenseNumber}
                helperText={errors.fssaiLicenseNumber?.message}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="GST Number (Optional)"
                {...register('gstNumber')}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="FSSAI License Document URL"
                placeholder="Upload your FSSAI license and paste the URL here"
                {...register('fssaiLicenseUrl', { required: 'FSSAI document is required' })}
                error={!!errors.fssaiLicenseUrl}
                helperText={errors.fssaiLicenseUrl?.message}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Shop Establishment Certificate URL"
                placeholder="Upload your shop establishment certificate and paste the URL here"
                {...register('shopEstablishmentUrl')}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="GST Certificate URL (Optional)"
                placeholder="Upload your GST certificate and paste the URL here"
                {...register('gstCertificateUrl')}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Owner Photo URL (Optional)"
                placeholder="Upload your photo and paste the URL here"
                {...register('ownerPhotoUrl')}
              />
            </Grid>
          </Grid>
        )

      case 3:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Review Your Information
            </Typography>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Personal Information
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Name: {watch('name')}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Email: {watch('email')}
                </Typography>
                <Typography variant="body2" sx={{ mb: 3 }}>
                  Phone: {watch('phone')}
                </Typography>

                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Restaurant Information
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Restaurant: {watch('restaurantName')}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Address: {watch('street')}, {watch('city')} - {watch('pincode')}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Cuisines: {selectedCuisines.join(', ')}
                </Typography>
                <Typography variant="body2">
                  FSSAI License: {watch('fssaiLicenseNumber')}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        )

      default:
        return null
    }
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box textAlign="center" sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              {isRestaurant ? (
                <BuildingStorefrontIcon className="h-8 w-8 text-orange-500 mr-2" />
              ) : (
                <UserIcon className="h-8 w-8 text-green-500 mr-2" />
              )}
              <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
                {isRestaurant ? 'Restaurant Registration' : 'Customer Registration'}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {isRestaurant 
                ? 'Join Eatio as a restaurant partner and grow your business'
                : 'Create your account to start ordering delicious food'
              }
            </Typography>
          </Box>

          {/* Stepper for Restaurant Registration */}
          {isRestaurant && (
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            {renderStepContent(activeStep)}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              {isRestaurant && activeStep > 0 && (
                <Button onClick={handleBack}>
                  Back
                </Button>
              )}
              
              <Box sx={{ flex: '1 1 auto' }} />
              
              {isRestaurant && activeStep < steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={registerMutation.isPending}
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={registerMutation.isPending}
                  sx={{ minWidth: 120 }}
                >
                  {registerMutation.isPending ? (
                    <LoadingSpinner size={24} />
                  ) : isRestaurant ? (
                    'Submit for Approval'
                  ) : (
                    'Create Account'
                  )}
                </Button>
              )}
            </Box>
          </form>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>

          <Box textAlign="center">
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link to="/login">
                <Typography component="span" color="primary" fontWeight={500}>
                  Sign in
                </Typography>
              </Link>
            </Typography>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  )
}

export default RegisterPage