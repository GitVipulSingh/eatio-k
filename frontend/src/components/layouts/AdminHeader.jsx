import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  useMediaQuery,
  useTheme as useMuiTheme,
} from '@mui/material'
import {
  UserIcon,
  Bars3Icon,
  MoonIcon,
  SunIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline'

import { useTheme } from '../../client/contexts/ThemeContext'
import { useLogout } from '../../client/api/queries'
import { logout } from '../../client/store/slices/authSlice'

const AdminHeader = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const muiTheme = useMuiTheme()
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'))
  
  const { isDarkMode, toggleTheme } = useTheme()
  const { user } = useSelector(state => state.auth)
  
  const [anchorEl, setAnchorEl] = useState(null)
  
  const logoutMutation = useLogout()

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync()
      dispatch(logout())
      navigate('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
    handleMenuClose()
  }

  const getMenuItems = () => {
    if (user?.role === 'admin') {
      return [
        { label: 'Dashboard', path: '/admin/dashboard' },
        { label: 'Menu Management', path: '/admin/menu' },
        { label: 'Orders', path: '/admin/orders' },
        { label: 'Reviews', path: '/admin/reviews' },
      ]
    } else if (user?.role === 'superadmin') {
      return [
        { label: 'Dashboard', path: '/super-admin/dashboard' },
        { label: 'Restaurant Approvals', path: '/super-admin/restaurants' },
      ]
    }
    return []
  }

  const menuItems = getMenuItems()

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{ 
        backgroundColor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        backdropFilter: 'blur(10px)',
        background: 'rgba(255, 255, 255, 0.95)',
      }}
    >
      <Toolbar sx={{ px: { xs: 2, lg: 4 }, minHeight: { xs: 64, sm: 70 } }}>
        {/* Logo */}
        <Link to={user?.role === 'admin' ? '/admin/dashboard' : '/super-admin/dashboard'} style={{ textDecoration: 'none' }}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'linear-gradient(45deg, #f97316, #ea580c)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}
            >
              🍽️
            </Box>
            <Typography
              variant="h5"
              component="div"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(45deg, #f97316, #ea580c)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: { xs: 'none', sm: 'block' }
              }}
            >
              Eatio {user?.role === 'superadmin' ? 'Admin' : 'Restaurant'}
            </Typography>
          </motion.div>
        </Link>

        <Box sx={{ flexGrow: 1 }} />

        {/* Navigation Menu */}
        {!isMobile && (
          <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
            {menuItems.map((item) => (
              <Button
                key={item.path}
                component={Link}
                to={item.path}
                sx={{ 
                  fontWeight: 500,
                  color: 'text.primary',
                  '&:hover': {
                    backgroundColor: 'primary.light',
                    color: 'primary.contrastText'
                  }
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        )}

        {/* Theme Toggle */}
        <IconButton
          onClick={toggleTheme}
          aria-label="toggle theme"
          sx={{ 
            mr: 1,
            color: 'text.primary',
            '&:hover': {
              backgroundColor: 'action.hover'
            }
          }}
        >
          {isDarkMode ? (
            <SunIcon className="h-5 w-5" />
          ) : (
            <MoonIcon className="h-5 w-5" />
          )}
        </IconButton>

        {/* Profile Menu */}
        <div>
          <IconButton
            onClick={handleProfileMenuOpen}
            aria-label="account"
            sx={{
              color: 'text.primary',
              '&:hover': {
                backgroundColor: 'action.hover'
              }
            }}
          >
            <Avatar
              sx={{ width: 32, height: 32 }}
              src={user?.avatar}
              alt={user?.name}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem disabled>
              <Typography variant="body2" color="text.secondary">
                {user?.name} ({user?.role})
              </Typography>
            </MenuItem>
            {isMobile && menuItems.map((item) => (
              <MenuItem
                key={item.path}
                onClick={() => {
                  navigate(item.path)
                  handleMenuClose()
                }}
              >
                {item.label}
              </MenuItem>
            ))}
            <MenuItem onClick={handleLogout}>
              Logout
            </MenuItem>
          </Menu>
        </div>
      </Toolbar>
    </AppBar>
  )
}

export default AdminHeader