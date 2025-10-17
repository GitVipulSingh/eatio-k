import React from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Typography,
  Box,
} from '@mui/material'
import {
  HomeIcon,
  UserIcon,
  ClockIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline'

const MobileMenu = ({ open, onClose, isAuthenticated, user, onLogout }) => {
  const menuItems = [
    { label: 'Home', path: '/', icon: HomeIcon },
    ...(isAuthenticated
      ? [
          { label: 'Profile', path: '/profile', icon: UserIcon },
          { label: 'Order History', path: '/order-history', icon: ClockIcon },
        ]
      : []),
  ]

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: 280 },
      }}
    >
      <Box sx={{ p: 2 }}>
        {isAuthenticated ? (
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar src={user?.avatar} alt={user?.name}>
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                {user?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
            </Box>
          </Box>
        ) : (
          <Typography variant="h6" fontWeight={600}>
            Welcome to Eatio
          </Typography>
        )}
      </Box>

      <Divider />

      <List>
        <AnimatePresence>
          {menuItems.map((item, index) => (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <ListItem disablePadding>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  onClick={onClose}
                >
                  <ListItemIcon>
                    <item.icon className="h-5 w-5" />
                  </ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            </motion.div>
          ))}
        </AnimatePresence>
      </List>

      <Divider />

      <List>
        {isAuthenticated ? (
          <ListItem disablePadding>
            <ListItemButton onClick={onLogout}>
              <ListItemIcon>
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
        ) : (
          <>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/login" onClick={onClose}>
                <ListItemIcon>
                  <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                </ListItemIcon>
                <ListItemText primary="Login" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/register" onClick={onClose}>
                <ListItemIcon>
                  <UserIcon className="h-5 w-5" />
                </ListItemIcon>
                <ListItemText primary="Sign Up" />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>
    </Drawer>
  )
}

export default MobileMenu