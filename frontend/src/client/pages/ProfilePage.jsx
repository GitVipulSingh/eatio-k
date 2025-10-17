import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Avatar,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
} from '@mui/material'
import {
  UserIcon,
  ClockIcon,
  MapPinIcon,
  CreditCardIcon,
  BellIcon,
  ShieldCheckIcon,
  HeartIcon,
  GiftIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

import { useOrderHistory } from '../api/queries'

const ProfilePage = () => {
  const navigate = useNavigate()
  const { user } = useSelector(state => state.auth)
  const { data: orders } = useOrderHistory()
  
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editData, setEditData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  })

  const handleEditProfile = () => {
    setEditDialogOpen(true)
  }

  const handleSaveProfile = () => {
    // TODO: Implement profile update API call
    toast.success('Profile updated successfully!')
    setEditDialogOpen(false)
  }

  const getOrderStats = () => {
    if (!orders) return { total: 0, delivered: 0, totalSpent: 0 }
    
    const delivered = orders.filter(order => order.status === 'Delivered').length
    const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0)
    
    return {
      total: orders.length,
      delivered,
      totalSpent
    }
  }

  const stats = getOrderStats()

  const menuItems = [
    {
      icon: <ClockIcon className="h-5 w-5" />,
      title: 'Order History',
      subtitle: `${stats.total} orders placed`,
      action: () => navigate('/order-history'),
      color: 'primary'
    },
    {
      icon: <MapPinIcon className="h-5 w-5" />,
      title: 'Saved Addresses',
      subtitle: 'Manage delivery addresses',
      action: () => toast.info('Address management coming soon!'),
      color: 'secondary'
    },
    {
      icon: <CreditCardIcon className="h-5 w-5" />,
      title: 'Payment Methods',
      subtitle: 'Manage payment options',
      action: () => toast.info('Payment management coming soon!'),
      color: 'success'
    },
    {
      icon: <HeartIcon className="h-5 w-5" />,
      title: 'Favorites',
      subtitle: 'Your favorite restaurants',
      action: () => toast.info('Favorites coming soon!'),
      color: 'error'
    },
    {
      icon: <BellIcon className="h-5 w-5" />,
      title: 'Notifications',
      subtitle: 'Manage notifications',
      action: () => toast.info('Notification settings coming soon!'),
      color: 'warning'
    },
    {
      icon: <GiftIcon className="h-5 w-5" />,
      title: 'Offers & Coupons',
      subtitle: 'View available offers',
      action: () => toast.info('Offers coming soon!'),
      color: 'info'
    }
  ]

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Grid container spacing={4}>
          {/* Profile Header */}
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
                  <Avatar
                    sx={{ width: 64, height: 64, fontSize: '1.5rem' }}
                    src={user?.avatar}
                  >
                    {user?.name?.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {user?.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      {user?.email}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {user?.phone}
                    </Typography>
                    <Chip
                      icon={<ShieldCheckIcon className="h-3 w-3" />}
                      label={user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<UserIcon className="h-4 w-4" />}
                    onClick={handleEditProfile}
                  >
                    Edit Profile
                  </Button>
                </Box>

                {/* Stats */}
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: 'center', p: 1.5, backgroundColor: 'primary.light', borderRadius: 1.5 }}>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.contrastText' }}>
                        {stats.total}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'primary.contrastText', opacity: 0.8 }}>
                        Total Orders
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: 'center', p: 1.5, backgroundColor: 'success.light', borderRadius: 1.5 }}>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.contrastText' }}>
                        {stats.delivered}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'success.contrastText', opacity: 0.8 }}>
                        Delivered
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: 'center', p: 1.5, backgroundColor: 'secondary.light', borderRadius: 1.5 }}>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: 'secondary.contrastText' }}>
                        ₹{stats.totalSpent}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'secondary.contrastText', opacity: 0.8 }}>
                        Total Spent
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Menu Items */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Account Settings
                </Typography>
                <List disablePadding>
                  {menuItems.map((item, index) => (
                    <React.Fragment key={item.title}>
                      <ListItemButton
                        onClick={item.action}
                        sx={{
                          borderRadius: 1,
                          mb: 1,
                          '&:hover': {
                            backgroundColor: `${item.color}.light`,
                            '& .MuiListItemIcon-root': {
                              color: `${item.color}.main`
                            }
                          }
                        }}
                      >
                        <ListItemIcon sx={{ color: `${item.color}.main` }}>
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={item.title}
                          secondary={item.subtitle}
                          primaryTypographyProps={{ fontWeight: 500 }}
                        />
                        <ArrowRightIcon className="h-4 w-4 text-gray-400" />
                      </ListItemButton>
                      {index < menuItems.length - 1 && <Divider sx={{ my: 1 }} />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => navigate('/order-history')}
                    startIcon={<ClockIcon className="h-4 w-4" />}
                  >
                    View Orders
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate('/')}
                    startIcon={<HeartIcon className="h-4 w-4" />}
                  >
                    Browse Restaurants
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => toast.info('Support coming soon!')}
                    startIcon={<BellIcon className="h-4 w-4" />}
                  >
                    Contact Support
                  </Button>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Member since
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Edit Profile Dialog */}
        <Dialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Full Name"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={editData.email}
                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Phone Number"
                value={editData.phone}
                onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSaveProfile}>
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
      </motion.div>
    </Container>
  )
}

export default ProfilePage