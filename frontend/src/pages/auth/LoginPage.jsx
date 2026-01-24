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

import { useLogin } from '../../client/api/queries'
import { loginSuccess } from '../../client/store/slices/authSlice'
import LoadingSpinner from '../../common/components/LoadingSpinner'
import { navigateByRole } from '../../utils/roleRedirects'

const LoginPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const loginMutation = useLogin()

  const onSubmit = async (data) => {
    try {
      const userData = await loginMutation.mutateAsync({
        email: data.email,
        password: data.password,
      })
      
      dispatch(loginSuccess({ user: userData }))
      toast.success('Welcome back! 🎉')
      
      // Use centralized role-based redirect
      navigateByRole(userData.role, navigate)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed')
    }
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
      display: 'flex',
      alignItems: 'center',
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

      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
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
                Welcome Back!
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
                Sign in to continue your food journey
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

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
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

            <Box sx={{ mb: 4 }}>
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                {...register('password', {
                  required: 'Password is required'
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

            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loginMutation.isPending}
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
                {loginMutation.isPending ? (
                  <LoadingSpinner size={24} />
                ) : (
                  'Sign In to Eatio'
                )}
              </Button>
            </motion.div>

            <Divider sx={{ mb: 4 }}>
              <Typography variant="body2" color="text.secondary">
                New to Eatio?
              </Typography>
            </Divider>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Join thousands of food lovers!
              </Typography>
              <Button
                component={Link}
                to="/"
                variant="outlined"
                size="large"
                sx={{
                  borderRadius: 3,
                  fontWeight: 600,
                  px: 4,
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.light',
                    borderColor: 'primary.main',
                  }
                }}
              >
                Create Account
              </Button>
            </Box>
          </form>
        </Paper>
      </motion.div>
    </Container>
    </Box>
  )
}

export default LoginPage