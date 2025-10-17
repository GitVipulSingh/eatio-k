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
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Box,
  useMediaQuery,
  useTheme as useMuiTheme,
} from '@mui/material'
import {
  ShoppingCartIcon,
  UserIcon,
  Bars3Icon,
  MoonIcon,
  SunIcon,
} from '@heroicons/react/24/outline'

import { useTheme } from '../../contexts/ThemeContext'
import { useLogout } from '../../api/queries'
import { logout } from '../../store/slices/authSlice'
import SearchBar from '../ui/SearchBar'
import MobileMenu from './MobileMenu'

const Header = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const muiTheme = useMuiTheme()
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'))
  
  const { isDarkMode, toggleTheme } = useTheme()
  const { user, isAuthenticated } = useSelector(state => state.auth)
  const { totalItems } = useSelector(state => state.cart)
  
  const [anchorEl, setAnchorEl] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
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
    const baseItems = [{ label: 'Profile', path: '/profile' }]
    
    if (user?.role === 'customer') {
      return [
        ...baseItems,
        { label: 'Order History', path: '/order-history' },
      ]
    } else if (user?.role === 'admin') {
      return [
        ...baseItems,
        { label: 'Restaurant Dashboard', path: '/restaurant-dashboard' },
      ]
    } else if (user?.role === 'superadmin') {
      return [
        ...baseItems,
        { label: 'Super Admin', path: '/super-admin' },
      ]
    }
    
    return baseItems
  }

  const menuItems = getMenuItems()

  return (
    <>
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
          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={() => setMobileMenuOpen(true)}
              className="mr-2"
            >
              <Bars3Icon className="h-6 w-6" />
            </IconButton>
          )}

          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none' }}>
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
                Eatio
              </Typography>
            </motion.div>
          </Link>

          {/* Search Bar - Desktop */}
          {!isMobile && (
            <Box sx={{ flexGrow: 1, mx: 4 }}>
              <SearchBar />
            </Box>
          )}

          <Box sx={{ flexGrow: isMobile ? 1 : 0 }} />

          {/* Theme Toggle */}
          <IconButton
            onClick={toggleTheme}
            color="inherit"
            aria-label="toggle theme"
            className="mr-2"
          >
            {isDarkMode ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </IconButton>

          {/* Cart */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <IconButton
              component={Link}
              to="/cart"
              color="inherit"
              aria-label="shopping cart"
              sx={{ 
                mr: 1,
                backgroundColor: totalItems > 0 ? 'primary.light' : 'transparent',
                '&:hover': {
                  backgroundColor: 'primary.light',
                }
              }}
            >
              <Badge 
                badgeContent={totalItems} 
                color="primary"
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: '0.75rem',
                    minWidth: '18px',
                    height: '18px'
                  }
                }}
              >
                <ShoppingCartIcon className="h-5 w-5" />
              </Badge>
            </IconButton>
          </motion.div>

          {/* Auth Section */}
          {isAuthenticated ? (
            <div>
              <IconButton
                onClick={handleProfileMenuOpen}
                color="inherit"
                aria-label="account"
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
                    {user?.name}
                  </Typography>
                </MenuItem>
                {menuItems.map((item) => (
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
          ) : (
            <div className="flex items-center space-x-2">
              <Button
                component={Link}
                to="/login"
                color="inherit"
                startIcon={<UserIcon className="h-4 w-4" />}
              >
                Login
              </Button>
              <Button
                component={Link}
                to="/register"
                variant="contained"
                color="primary"
              >
                Sign Up
              </Button>
            </div>
          )}
        </Toolbar>

        {/* Mobile Search Bar */}
        {isMobile && (
          <Box sx={{ px: 2, pb: 2 }}>
            <SearchBar />
          </Box>
        )}
      </AppBar>

      {/* Mobile Menu */}
      <MobileMenu
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        isAuthenticated={isAuthenticated}
        user={user}
        onLogout={handleLogout}
      />
    </>
  )
}

export default Header