import { useState } from 'react'
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
      {/* FORCE Login Button Visibility - Maximum Specificity */}
      <style>
        {`
          .MuiToolbar-root .auth-buttons .login-button-visible.MuiButton-root.MuiButton-contained {
            background: #f97316 !important;
            background-color: #f97316 !important;
            background-image: linear-gradient(135deg, #f97316, #ea580c) !important;
            color: #ffffff !important;
            opacity: 1 !important;
            visibility: visible !important;
            border: none !important;
            box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3) !important;
          }
          .MuiToolbar-root .auth-buttons .login-button-visible.MuiButton-root.MuiButton-contained:hover {
            background: #ea580c !important;
            background-color: #ea580c !important;
            background-image: linear-gradient(135deg, #ea580c, #c2410c) !important;
            color: #ffffff !important;
          }
          .MuiToolbar-root .auth-buttons .login-button-visible.MuiButton-root.MuiButton-contained:focus {
            background: #f97316 !important;
            background-color: #f97316 !important;
            color: #ffffff !important;
          }
          .MuiToolbar-root .auth-buttons .login-button-visible.MuiButton-root.MuiButton-contained:active {
            background: #ea580c !important;
            background-color: #ea580c !important;
            color: #ffffff !important;
          }
        `}
      </style>
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderBottom: '1px solid',
          borderColor: 'grey.100',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <Toolbar sx={{ 
          px: { xs: isAuthenticated ? 2 : 1, sm: 2, lg: 4 }, 
          minHeight: { xs: 60, sm: 70 }, 
          gap: { xs: isAuthenticated ? 1 : 0.5, sm: isAuthenticated ? 2 : 1 } 
        }}>
          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={() => setMobileMenuOpen(true)}
              sx={{ p: 1 }}
            >
              <Bars3Icon className="h-6 w-6" />
            </IconButton>
          )}

          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '12px' }}
            >
              <Box
                sx={{
                  width: { xs: 36, sm: 44 },
                  height: { xs: 36, sm: 44 },
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #f97316, #ea580c)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: { xs: '1.2rem', sm: '1.4rem' },
                  boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
                }}
              >
                🍽️
              </Box>
              <Typography
                variant="h5"
                component="div"
                sx={{
                  fontWeight: 800,
                  background: 'linear-gradient(45deg, #f97316, #ea580c)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: { xs: 'none', sm: 'block' },
                  fontSize: { sm: '1.3rem', md: '1.5rem' },
                  letterSpacing: '-0.5px'
                }}
              >
                Eatio
              </Typography>
            </motion.div>
          </Link>

          {/* Search Bar - Desktop - Conditional Layout Based on Auth Status */}
          {!isMobile && (
            <Box sx={{ 
              flexGrow: 1, 
              mx: 4, 
              // LOGGED-IN: Full width search bar (original behavior)
              // LOGGED-OUT: Constrained search bar to make space for auth buttons
              maxWidth: isAuthenticated ? 'none' : '500px',
              display: 'flex',
              justifyContent: isAuthenticated ? 'flex-start' : 'center'
            }}>
              <SearchBar />
            </Box>
          )}

          <Box sx={{ flexGrow: isMobile ? 1 : 0 }} />

          {/* Theme Toggle */}
          <IconButton
            onClick={toggleTheme}
            color="inherit"
            aria-label="toggle theme"
            sx={{ 
              mr: { xs: isAuthenticated ? 1 : 0.5, sm: isAuthenticated ? 2 : 1 },
              width: { xs: isAuthenticated ? 44 : 36, sm: 44 },
              height: { xs: isAuthenticated ? 44 : 36, sm: 44 },
              p: { xs: isAuthenticated ? 1 : 0.5, sm: 1 }
            }}
          >
            {isDarkMode ? (
              <SunIcon className={isMobile && !isAuthenticated ? "h-4 w-4" : "h-5 w-5"} />
            ) : (
              <MoonIcon className={isMobile && !isAuthenticated ? "h-4 w-4" : "h-5 w-5"} />
            )}
          </IconButton>

          {/* Cart */}
          <IconButton
            component={Link}
            to="/cart"
            aria-label="shopping cart"
            sx={{ 
              mr: { xs: isAuthenticated ? 1 : 0.5, sm: isAuthenticated ? 2 : 1 },
              backgroundColor: totalItems > 0 ? 'primary.main' : 'grey.100',
              color: totalItems > 0 ? 'white' : 'grey.600',
              borderRadius: 2,
              width: { xs: isAuthenticated ? 44 : 36, sm: 44 },
              height: { xs: isAuthenticated ? 44 : 36, sm: 44 },
              '&:hover': {
                backgroundColor: totalItems > 0 ? 'primary.dark' : 'primary.light',
                color: totalItems > 0 ? 'white' : 'primary.main',
              },
              transition: 'all 0.2s ease'
            }}
          >
            <Badge 
              badgeContent={totalItems || 0} 
              color="error"
              sx={{
                '& .MuiBadge-badge': {
                  fontSize: { xs: '0.6rem', sm: '0.7rem' },
                  minWidth: { xs: '14px', sm: '16px' },
                  height: { xs: '14px', sm: '16px' },
                  display: totalItems > 0 ? 'flex' : 'none',
                }
              }}
            >
              <ShoppingCartIcon 
                style={{ 
                  width: isMobile ? '18px' : '20px', 
                  height: isMobile ? '18px' : '20px',
                  display: 'block'
                }} 
              />
            </Badge>
          </IconButton>

          {/* Professional Authentication Buttons Section */}
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
            /* Professional Auth Buttons Container - Clean Styling */
            <Box 
              className="auth-buttons"
              sx={{ 
                display: 'flex !important', 
                alignItems: 'center !important', 
                gap: '16px', // Improved spacing between buttons
                flexShrink: '0 !important',
                ml: { xs: 1, sm: 2 },
                visibility: 'visible !important',
                opacity: '1 !important',
                zIndex: 10
              }}
            >
              {/* Log In Button - IDENTICAL to Sign Up Button */}
              <Button
                component={Link}
                to="/auth/login"
                variant="contained"
                className="login-button-visible"
                style={{
                  backgroundColor: '#f97316',
                  backgroundImage: 'linear-gradient(135deg, #f97316, #ea580c)',
                  color: '#ffffff',
                  border: 'none',
                  opacity: 1,
                  visibility: 'visible'
                }}
                sx={{
                  fontWeight: '600 !important',
                  textTransform: 'none !important',
                  minWidth: { xs: '70px', sm: '80px' },
                  px: { xs: 2, sm: 3 },
                  py: { xs: 0.75, sm: 1 },
                  fontSize: { xs: '0.8rem', sm: '0.9rem' },
                  borderRadius: '8px !important',
                  backgroundColor: '#f97316 !important',
                  backgroundImage: 'linear-gradient(135deg, #f97316, #ea580c) !important',
                  color: '#ffffff !important',
                  boxShadow: '0 2px 8px rgba(249, 115, 22, 0.3) !important',
                  border: 'none !important',
                  opacity: '1 !important',
                  visibility: 'visible !important',
                  display: 'inline-flex !important',
                  '&.MuiButton-root': {
                    backgroundColor: '#f97316 !important',
                    color: '#ffffff !important',
                  },
                  '&:hover': {
                    background: '#ea580c !important',
                    backgroundImage: 'linear-gradient(135deg, #ea580c, #c2410c) !important',
                    boxShadow: '0 4px 12px rgba(249, 115, 22, 0.4) !important',
                    transform: 'translateY(-1px) !important',
                    color: '#ffffff !important',
                  },
                  '&:focus': {
                    background: '#f97316 !important',
                    color: '#ffffff !important',
                  },
                  '&:active': {
                    background: '#ea580c !important',
                    color: '#ffffff !important',
                  },
                  transition: 'all 0.2s ease !important'
                }}
              >
                Log In
              </Button>
              
              {/* Sign Up Button - BULLETPROOF VISIBILITY STYLING */}
              <Button
                component={Link}
                to="/auth/register/customer"
                variant="contained"
                sx={{
                  fontWeight: '600 !important',
                  textTransform: 'none !important',
                  minWidth: { xs: '70px', sm: '80px' },
                  px: { xs: 2, sm: 3 },
                  py: { xs: 0.75, sm: 1 },
                  fontSize: { xs: '0.8rem', sm: '0.9rem' },
                  borderRadius: '8px !important',
                  background: '#f97316 !important', // Solid fallback color
                  backgroundImage: 'linear-gradient(135deg, #f97316, #ea580c) !important',
                  color: '#ffffff !important',
                  boxShadow: '0 2px 8px rgba(249, 115, 22, 0.3) !important',
                  border: 'none !important',
                  opacity: '1 !important',
                  visibility: 'visible !important',
                  display: 'inline-flex !important',
                  '&:hover': {
                    background: '#ea580c !important',
                    backgroundImage: 'linear-gradient(135deg, #ea580c, #c2410c) !important',
                    boxShadow: '0 4px 12px rgba(249, 115, 22, 0.4) !important',
                    transform: 'translateY(-1px) !important',
                    color: '#ffffff !important',
                  },
                  '&:focus': {
                    background: '#f97316 !important',
                    color: '#ffffff !important',
                  },
                  '&:active': {
                    background: '#ea580c !important',
                    color: '#ffffff !important',
                  },
                  transition: 'all 0.2s ease !important'
                }}
              >
                Sign Up
              </Button>
            </Box>
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