import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
} from '@mui/material'
import {
  XMarkIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline'

const LoginPrompt = ({ open, onClose, message = "Please log in to add items to your cart" }) => {
  const navigate = useNavigate()

  const handleLogin = () => {
    onClose()
    navigate('/auth/login')
  }

  const handleRegister = () => {
    onClose()
    navigate('/auth/register/customer')
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 1,
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        pb: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <UserCircleIcon className="h-6 w-6" />
          <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
            Login Required
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <XMarkIcon className="h-5 w-5" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
          {message}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Join thousands of food lovers and enjoy seamless ordering, order tracking, and exclusive offers!
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ 
            borderRadius: 2,
            px: 3,
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleRegister}
          variant="outlined"
          color="primary"
          sx={{ 
            borderRadius: 2,
            px: 3,
          }}
        >
          Sign Up
        </Button>
        <Button
          onClick={handleLogin}
          variant="contained"
          sx={{ 
            borderRadius: 2,
            px: 3,
            fontWeight: 600,
          }}
        >
          Log In
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default LoginPrompt