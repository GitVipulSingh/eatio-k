import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  useMediaQuery,
  useTheme as useMuiTheme,
  IconButton,
} from '@mui/material'
import {
  Bars3Icon,
  MoonIcon,
  SunIcon,
} from '@heroicons/react/24/outline'

import { useTheme } from '../../client/contexts/ThemeContext'
import SearchBar from '../../client/components/ui/SearchBar'

const LandingHeader = () => {
  const muiTheme = useMuiTheme()
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'))
  const { isDarkMode, toggleTheme } = useTheme()

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
          sx={{ mr: 1 }}
        >
          {isDarkMode ? (
            <SunIcon className="h-5 w-5" />
          ) : (
            <MoonIcon className="h-5 w-5" />
          )}
        </IconButton>

        {/* Auth Buttons */}
        <div className="flex items-center space-x-2">
          <Button
            component={Link}
            to="/auth/register/customer"
            variant="contained"
            color="primary"
          >
            Sign Up
          </Button>
        </div>
      </Toolbar>

      {/* Mobile Search Bar */}
      {isMobile && (
        <Box sx={{ px: 2, pb: 2 }}>
          <SearchBar />
        </Box>
      )}
    </AppBar>
  )
}

export default LandingHeader