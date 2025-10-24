import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
  Alert,
  Divider,
  IconButton,
  InputAdornment,
} from '@mui/material'
import {
  EyeIcon,
  EyeSlashIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

import { useRegister } from '../../client/api/queries'
import { loginSuccess } from '../../client/store/slices/authSlice'
import LoadingSpinner from '../../common/components/LoadingSpinner'

const CustomerRegisterPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm()

  const registerMutation = useRegister()
  const password = watch('password')

  const onSubmit = async (data) => {
    try {
      const userData = await registerMutation.mutateAsync({
        ...data,
        role: 'customer' // Ensure customer role
      })
      
      dispatch(loginSuccess({ user: userData }))
      toast.success('Welcome to Eatio! 🎉')
      navigate('/')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
      py: 4,
      display: 'flex',
      alignItems: 'center',
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

      <Container maxWidth="sm">
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
                  🍽️
                </Box>
              </motion.div>
              
              <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, color: 'text.primary' }}>
                Join Eatio
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
                Create your account and start ordering delicious food!
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

          {/* Registration Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Full Name"
                {...register('name', {
                  required: 'Name is required',
                  minLength: {
                    value: 2,
                    message: 'Name must be at least 2 characters'
                  }
                })}
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Email Address"
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
            </Box>

            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Phone Number"
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
            </Box>

            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Password"
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
            </Box>

            <Box sx={{ mb: 4 }}>
              <TextField
                fullWidth
                label="Confirm Password"
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
            </Box>

            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={registerMutation.isPending}
                sx={{ 
                  mb: 4, 
                  py: 2,
                  borderRadius: 3,
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  background: 'linear-gradient(135deg, #f97316, #ea580c)',
                  boxShadow: '0 8px 24px rgba(249, 115, 22, 0.3)',
                  '&:hover': {
                    boxShadow: '0 12px 32px rgba(249, 115, 22, 0.4)',
                  }
                }}
              >
                {registerMutation.isPending ? (
                  <LoadingSpinner size={24} />
                ) : (
                  'Create Account'
                )}
              </Button>
            </motion.div>

            <Divider sx={{ mb: 3 }} />

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link
                  to="/auth/login"
                  style={{
                    color: 'inherit',
                    textDecoration: 'none',
                    fontWeight: 600,
                  }}
                >
                  Sign In
                </Link>
              </Typography>
            </Box>
          </form>
        </Paper>
      </motion.div>
    </Container>
    </Box>
  )
}

export default CustomerRegisterPage