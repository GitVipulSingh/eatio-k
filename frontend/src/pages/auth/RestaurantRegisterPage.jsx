import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  IconButton,
  InputAdornment,
  Grid,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardHeader,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material'
import {
  EyeIcon,
  EyeSlashIcon,
  ArrowLeftIcon,
  BuildingStorefrontIcon,
  DocumentIcon,
  PhotoIcon,
  CheckCircleIcon,
  CloudArrowUpIcon,
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

import { useRegister, useUploadRestaurantImage } from '../../client/api/queries'
import LoadingSpinner from '../../common/components/LoadingSpinner'

const RestaurantRegisterPage = () => {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  
  // Debug log to track page behavior
  useEffect(() => {
    console.log('🏪 Restaurant Registration Page mounted')
    console.log('📍 Current path:', window.location.pathname)
    
    return () => {
      console.log('🏪 Restaurant Registration Page unmounted')
    }
  }, [])
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [cuisines, setCuisines] = useState([])
  const [activeStep, setActiveStep] = useState(0)
  const [uploadedFiles, setUploadedFiles] = useState({})
  const [uploadingFiles, setUploadingFiles] = useState({})
  const [successDialogOpen, setSuccessDialogOpen] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
  } = useForm()

  const registerMutation = useRegister()
  const uploadRestaurantImageMutation = useUploadRestaurantImage()
  const password = watch('password')

  const steps = ['Owner Details', 'Restaurant Info', 'Documents', 'Review & Submit']

  const cuisineOptions = [
    'Indian', 'Chinese', 'Italian', 'Mexican', 'Thai', 'Japanese', 'American',
    'Mediterranean', 'French', 'Korean', 'Vietnamese', 'Lebanese', 'Greek',
    'Spanish', 'Turkish', 'Continental', 'Fast Food', 'Desserts', 'Beverages'
  ]

  const handleCuisineChange = (event) => {
    const value = event.target.value
    setCuisines(typeof value === 'string' ? value.split(',') : value)
  }

  const handleFileUpload = async (event, fileType) => {
    const file = event.target.files[0]
    if (file) {
      try {
        setUploadingFiles(prev => ({ ...prev, [fileType]: true }))
        
        if (fileType === 'restaurantPhoto') {
          // Upload restaurant photo to Cloudinary using public registration endpoint
          const formData = new FormData()
          formData.append('image', file)
          
          const { data } = await api.post('/registration-images/restaurant', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          })
          
          setUploadedFiles(prev => ({
            ...prev,
            [fileType]: data.imageUrl
          }))
          toast.success('Restaurant photo uploaded successfully!')
        } else if (fileType === 'fssaiLicense') {
          // Upload FSSAI document to Cloudinary using public registration endpoint
          const formData = new FormData()
          formData.append('document', file)
          
          const { data } = await api.post('/registration-images/document', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          })
          
          setUploadedFiles(prev => ({
            ...prev,
            [fileType]: data.documentUrl
          }))
          toast.success('FSSAI License uploaded successfully!')
        } else {
          // For other document types, store file name for now
          setUploadedFiles(prev => ({
            ...prev,
            [fileType]: file.name
          }))
          toast.success(`${fileType} uploaded successfully!`)
        }
      } catch (error) {
        toast.error(`Failed to upload ${fileType}`)
        console.error('Upload error:', error)
      } finally {
        setUploadingFiles(prev => ({ ...prev, [fileType]: false }))
      }
    }
  }

  const handleNext = async () => {
    const fieldsToValidate = getFieldsForStep(activeStep)
    const isValid = await trigger(fieldsToValidate)
    
    if (isValid) {
      setActiveStep((prevStep) => prevStep + 1)
    }
  }

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1)
  }

  const getFieldsForStep = (step) => {
    switch (step) {
      case 0:
        return ['name', 'email', 'phone', 'password', 'confirmPassword']
      case 1:
        return ['restaurantName', 'street', 'city', 'state', 'pincode', 'fssaiLicenseNumber']
      case 2:
        return [] // Documents are optional
      default:
        return []
    }
  }

  const onSubmit = async (data) => {
    try {
      // Prepare the restaurant data according to the specified format
      const restaurantData = {
        // Owner account details
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: 'admin',
        
        // Restaurant details
        restaurantDetails: {
          name: data.restaurantName,
          description: data.description || '',
          address: {
            street: data.street,
            city: data.city,
            state: data.state,
            pincode: data.pincode,
          },
          cuisine: cuisines,
          averageRating: parseFloat(data.averageRating) || 0,
          fssaiLicenseNumber: data.fssaiLicenseNumber,
          status: 'pending',
          documents: uploadedFiles,
        }
      }

      await registerMutation.mutateAsync(restaurantData)
      
      setSuccessDialogOpen(true)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed')
    }
  }

  const handleSuccessClose = () => {
    setSuccessDialogOpen(false)
    navigate('/auth/login')
  }

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Owner Information
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Owner Name *"
                  {...register('name', {
                    required: 'Owner name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must be at least 2 characters'
                    }
                  })}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email Address *"
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone Number *"
                  {...register('phone', {
                    required: 'Phone number is required',
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: 'Please enter a valid 10-digit phone number'
                    }
                  })}
                  error={!!errors.phone}
                  helperText={errors.phone?.message}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Password *"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? (
                            <EyeSlashIcon className="h-4 w-4" />
                          ) : (
                            <EyeIcon className="h-4 w-4" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Confirm Password *"
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) =>
                      value === password || 'Passwords do not match'
                  })}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? (
                            <EyeSlashIcon className="h-4 w-4" />
                          ) : (
                            <EyeIcon className="h-4 w-4" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        )

      case 1:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Restaurant Information
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Restaurant Name *"
                  {...register('restaurantName', {
                    required: 'Restaurant name is required'
                  })}
                  error={!!errors.restaurantName}
                  helperText={errors.restaurantName?.message}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Restaurant Description"
                  multiline
                  rows={3}
                  {...register('description')}
                  helperText="Brief description of your restaurant and specialties"
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="cuisine-types-label">Cuisine Types *</InputLabel>
                  <Select
                    labelId="cuisine-types-label"
                    id="cuisine-types-select"
                    multiple
                    value={cuisines}
                    onChange={handleCuisineChange}
                    label="Cuisine Types *"
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

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="FSSAI License Number *"
                  {...register('fssaiLicenseNumber', {
                    required: 'FSSAI License Number is required',
                    minLength: {
                      value: 14,
                      message: 'FSSAI License must be 14 digits'
                    }
                  })}
                  error={!!errors.fssaiLicenseNumber}
                  helperText={errors.fssaiLicenseNumber?.message}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Average Rating (Optional)"
                  type="number"
                  inputProps={{ min: 0, max: 5, step: 0.1 }}
                  {...register('averageRating')}
                  helperText="Current rating if available (0-5)"
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  Restaurant Address *
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Street Address *"
                  {...register('street', {
                    required: 'Street address is required'
                  })}
                  error={!!errors.street}
                  helperText={errors.street?.message}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="City *"
                  {...register('city', {
                    required: 'City is required'
                  })}
                  error={!!errors.city}
                  helperText={errors.city?.message}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="State *"
                  {...register('state', {
                    required: 'State is required'
                  })}
                  error={!!errors.state}
                  helperText={errors.state?.message}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Pincode *"
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
          </Box>
        )

      case 2:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Documents Upload
            </Typography>

            <Alert severity="info" sx={{ mb: 3 }}>
              Upload your restaurant documents. You can manage your menu items after approval from your restaurant dashboard.
            </Alert>

            {/* Document Upload Section */}
            <Card>
              <CardHeader title="Upload Documents (Optional)" />
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ textAlign: 'center', p: 3, border: '2px dashed #ccc', borderRadius: 2 }}>
                      <DocumentIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        FSSAI License Document
                      </Typography>
                      <input
                        accept=".pdf,.jpg,.jpeg,.png"
                        style={{ display: 'none' }}
                        id="fssai-upload"
                        type="file"
                        onChange={(e) => handleFileUpload(e, 'fssaiLicense')}
                      />
                      <label htmlFor="fssai-upload">
                        <Button variant="outlined" component="span" startIcon={<CloudArrowUpIcon className="h-4 w-4" />}>
                          Upload FSSAI License
                        </Button>
                      </label>
                      {uploadedFiles.fssaiLicense && (
                        <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 1 }}>
                          ✓ {uploadedFiles.fssaiLicense}
                        </Typography>
                      )}
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ textAlign: 'center', p: 3, border: '2px dashed #ccc', borderRadius: 2 }}>
                      <PhotoIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        Restaurant Photo
                      </Typography>
                      <input
                        accept=".jpg,.jpeg,.png"
                        style={{ display: 'none' }}
                        id="photo-upload"
                        type="file"
                        onChange={(e) => handleFileUpload(e, 'restaurantPhoto')}
                      />
                      <label htmlFor="photo-upload">
                        <Button 
                          variant="outlined" 
                          component="span" 
                          startIcon={uploadingFiles.restaurantPhoto ? <LoadingSpinner size={16} /> : <CloudArrowUpIcon className="h-4 w-4" />}
                          disabled={uploadingFiles.restaurantPhoto}
                        >
                          {uploadingFiles.restaurantPhoto ? 'Uploading...' : 'Upload Photo'}
                        </Button>
                      </label>
                      {uploadedFiles.restaurantPhoto && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" color="success.main" sx={{ display: 'block' }}>
                            ✓ Photo uploaded successfully
                          </Typography>
                          <Box 
                            component="img" 
                            src={uploadedFiles.restaurantPhoto} 
                            alt="Restaurant preview"
                            sx={{ 
                              width: 60, 
                              height: 60, 
                              objectFit: 'cover', 
                              borderRadius: 1, 
                              mt: 1,
                              border: '2px solid',
                              borderColor: 'success.main'
                            }}
                          />
                        </Box>
                      )}
                    </Box>
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Note:</strong> After your restaurant is approved, you'll be able to manage your menu items, 
                    add photos, set prices, and organize categories from your restaurant dashboard.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )

      case 3:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Review Your Application
            </Typography>

            <Alert severity="info" sx={{ mb: 3 }}>
              Please review all information before submitting. Your application will be reviewed by our team within 24-48 hours.
            </Alert>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Owner Information" />
                  <CardContent>
                    <Typography variant="body2"><strong>Name:</strong> {watch('name')}</Typography>
                    <Typography variant="body2"><strong>Email:</strong> {watch('email')}</Typography>
                    <Typography variant="body2"><strong>Phone:</strong> {watch('phone')}</Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Restaurant Details" />
                  <CardContent>
                    <Typography variant="body2"><strong>Name:</strong> {watch('restaurantName')}</Typography>
                    <Typography variant="body2"><strong>FSSAI:</strong> {watch('fssaiLicenseNumber')}</Typography>
                    <Typography variant="body2"><strong>Cuisines:</strong> {cuisines.join(', ')}</Typography>
                    <Typography variant="body2">
                      <strong>Address:</strong> {watch('street')}, {watch('city')}, {watch('state')} - {watch('pincode')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card>
                  <CardHeader title="Documents" />
                  <CardContent>
                    {Object.keys(uploadedFiles).length > 0 ? (
                      <>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                          <strong>Documents Uploaded:</strong>
                        </Typography>
                        <List dense>
                          {uploadedFiles.fssaiLicense && (
                            <ListItem>
                              <ListItemIcon>
                                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                              </ListItemIcon>
                              <ListItemText primary="FSSAI License" secondary={uploadedFiles.fssaiLicense} />
                            </ListItem>
                          )}
                          {uploadedFiles.restaurantPhoto && (
                            <ListItem>
                              <ListItemIcon>
                                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                              </ListItemIcon>
                              <ListItemText primary="Restaurant Photo" secondary={uploadedFiles.restaurantPhoto} />
                            </ListItem>
                          )}
                        </List>
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No documents uploaded. You can upload them later from your dashboard.
                      </Typography>
                    )}
                    
                    <Box sx={{ mt: 2, p: 2, backgroundColor: 'info.light', borderRadius: 1 }}>
                      <Typography variant="body2" color="info.contrastText">
                        <strong>Next Steps:</strong> After approval, you can manage your menu items, 
                        upload food photos, and set up your complete restaurant profile from your dashboard.
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )

      default:
        return null
    }
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
      py: 4,
      position: 'relative'
    }}>
      {/* Top Back to Home Button */}
      <Box sx={{ 
        position: 'absolute', 
        top: 20, 
        left: 20,
        zIndex: 10
      }}>
        <Button
          component={Link}
          to="/"
          startIcon={<ArrowLeftIcon className="h-5 w-5" />}
          variant="contained"
          sx={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            color: 'primary.main',
            fontWeight: 600,
            px: 3,
            py: 1.5,
            borderRadius: 3,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            backdropFilter: 'blur(10px)',
            '&:hover': { 
              backgroundColor: 'white',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          Back to Home
        </Button>
      </Box>

      <Container maxWidth="md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper 
            elevation={0} 
            sx={{ 
              p: { xs: 3, sm: 5 },
              borderRadius: 4,
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Header */}
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: 4,
                    background: 'linear-gradient(135deg, #f97316, #ea580c)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    mx: 'auto',
                    mb: 3,
                    boxShadow: '0 8px 24px rgba(249, 115, 22, 0.3)',
                  }}
                >
                  🏪
                </Box>
              </motion.div>
              
              <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, color: 'text.primary' }}>
                Partner with Eatio
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
                Join our platform and start serving customers across the city
              </Typography>
            </Box>

            {/* Back to Home Button */}
            <Box sx={{ mb: 4 }}>
              <Button
                component={Link}
                to="/"
                startIcon={<ArrowLeftIcon className="h-5 w-5" />}
                variant="text"
                sx={{ 
                  color: 'text.secondary',
                  fontWeight: 500,
                  fontSize: '0.95rem',
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  '&:hover': { 
                    backgroundColor: 'primary.light',
                    color: 'primary.main',
                    transform: 'translateX(-2px)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                Back to Home
              </Button>
            </Box>

          {/* Stepper */}
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Form Content */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ mb: 4 }}>
              {renderStepContent(activeStep)}
            </Box>

            {/* Navigation Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                variant="outlined"
              >
                Back
              </Button>
              
              <Box sx={{ flex: '1 1 auto' }} />
              
              {activeStep === steps.length - 1 ? (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={registerMutation.isPending || cuisines.length === 0}
                  sx={{ minWidth: 120 }}
                >
                  {registerMutation.isPending ? (
                    <LoadingSpinner size={20} />
                  ) : (
                    'Submit Application'
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  variant="contained"
                  disabled={activeStep === 1 && cuisines.length === 0}
                >
                  Next
                </Button>
              )}
            </Box>

            {activeStep === 1 && cuisines.length === 0 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Please select at least one cuisine type to continue.
              </Alert>
            )}
          </form>

          {/* Success Dialog */}
          <Dialog
            open={successDialogOpen}
            onClose={handleSuccessClose}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle sx={{ textAlign: 'center', pt: 4 }}>
              <CheckCircleIcon className="h-16 w-16 mx-auto mb-2 text-green-500" />
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Application Submitted Successfully!
              </Typography>
            </DialogTitle>
            <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Thank you for partnering with Eatio! Your restaurant application has been submitted for review.
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>What's Next?</strong><br />
                  • Our team will review your application within 24-48 hours<br />
                  • You'll receive an email notification once approved<br />
                  • After approval, you can start managing your restaurant
                </Typography>
              </Alert>
              <Typography variant="body2" color="text.secondary">
                You can now sign in to track your application status.
              </Typography>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', pb: 4 }}>
              <Button
                onClick={handleSuccessClose}
                variant="contained"
                size="large"
              >
                Go to Sign In
              </Button>
            </DialogActions>
          </Dialog>
        </Paper>
      </motion.div>
    </Container>
    </Box>
  )
}

export default RestaurantRegisterPage