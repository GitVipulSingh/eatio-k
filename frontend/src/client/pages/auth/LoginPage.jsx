import React from 'react'
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
  Alert,
  Divider,
} from '@mui/material'
import { toast } from 'react-hot-toast'

import { useLogin } from '../../api/queries'
import { loginSuccess } from '../../store/slices/authSlice'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  
  const from = location.state?.from?.pathname || '/'
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const loginMutation = useLogin()

  const onSubmit = async (data) => {
    try {
      const result = await loginMutation.mutateAsync(data)
      dispatch(loginSuccess(result))
      toast.success('Login successful!')
      
      // Role-based redirection
      if (result.role === 'admin') {
        navigate('/restaurant-dashboard', { replace: true })
      } else if (result.role === 'superadmin') {
        navigate('/super-admin', { replace: true })
      } else {
        navigate(from, { replace: true })
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed')
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box textAlign="center" sx={{ mb: 4 }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
              Welcome Back
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to your Eatio account
            </Typography>
          </Box>

          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              margin="normal"
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

            <TextField
              fullWidth
              label="Password"
              type="password"
              margin="normal"
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

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loginMutation.isPending}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {loginMutation.isPending ? <LoadingSpinner size={24} /> : 'Sign In'}
            </Button>
          </form>

          <Box textAlign="center">
            <Link to="/forgot-password">
              <Typography variant="body2" color="primary">
                Forgot your password?
              </Typography>
            </Link>
          </Box>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>

          <Box textAlign="center">
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Link to="/register">
                <Typography component="span" color="primary" fontWeight={500}>
                  Sign up
                </Typography>
              </Link>
            </Typography>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  )
}

export default LoginPage