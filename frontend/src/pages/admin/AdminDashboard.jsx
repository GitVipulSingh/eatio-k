import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  Alert,
  IconButton,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
} from '@mui/material'
import {
  PlusIcon,
  EyeIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  StarIcon,
  ShoppingBagIcon,
  BuildingStorefrontIcon,
  ChartBarIcon,
  CogIcon,
  CameraIcon,
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

import { 
  useMyRestaurant, 
  useRestaurantOrders, 
  useUpdateRestaurantOpenStatus,
  useUploadRestaurantImage,
  useUpdateRestaurantPhoto
} from '../../client/api/queries'
import LoadingSpinner from '../../common/components/LoadingSpinner'
import { useAdminDashboardUpdates } from '../../hooks/useRealTimeUpdates'

const AdminDashboard = () => {
  const [hoursDialogOpen, setHoursDialogOpen] = useState(false)
  const [operatingHours, setOperatingHours] = useState({ open: '09:00', close: '22:00' })
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')

  const { data: restaurant, isLoading: restaurantLoading, refetch } = useMyRestaurant()
  const { data: orders, isLoading: ordersLoading } = useRestaurantOrders()
  const updateRestaurantStatusMutation = useUpdateRestaurantOpenStatus()
  const uploadRestaurantImageMutation = useUploadRestaurantImage()
  const updateRestaurantPhotoMutation = useUpdateRestaurantPhoto()

  // Enable real-time updates for restaurant admin dashboard
  useAdminDashboardUpdates(restaurant?._id)

  // Calculate stats
  const todayOrders = orders?.filter(order => {
    const today = new Date().toDateString()
    return new Date(order.createdAt).toDateString() === today
  }) || []

  const todayRevenue = todayOrders.reduce((sum, order) => sum + order.totalAmount, 0)
  const pendingOrders = orders?.filter(order =>
    ['Pending', 'Confirmed', 'Preparing'].includes(order.status)
  ) || []

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'warning',
      'Confirmed': 'info',
      'Preparing': 'primary',
      'Out for Delivery': 'secondary',
      'Delivered': 'success',
      'Cancelled': 'error'
    }
    return colors[status] || 'default'
  }

  const handleStatusToggle = async (isOpen) => {
    try {
      await updateRestaurantStatusMutation.mutateAsync({
        isOpen,
        operatingHours: restaurant?.operatingHours || operatingHours
      })
      toast.success(`Restaurant is now ${isOpen ? 'open' : 'closed'}`)
      refetch()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update restaurant status')
    }
  }

  const handleUpdateHours = async () => {
    try {
      await updateRestaurantStatusMutation.mutateAsync({
        isOpen: restaurant?.isOpen || true,
        operatingHours
      })
      toast.success('Operating hours updated successfully')
      setHoursDialogOpen(false)
      refetch()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update operating hours')
    }
  }

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB')
        return
      }
      
      setSelectedFile(file)
      
      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePhotoUpdate = async () => {
    if (!selectedFile) {
      toast.error('Please select an image')
      return
    }

    try {
      // First upload the image to Cloudinary
      const uploadResult = await uploadRestaurantImageMutation.mutateAsync(selectedFile)
      
      // Then update the restaurant photo in the database
      await updateRestaurantPhotoMutation.mutateAsync(uploadResult.imageUrl)
      
      toast.success('Restaurant photo updated successfully')
      setPhotoDialogOpen(false)
      setSelectedFile(null)
      setPreviewUrl('')
      refetch()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update restaurant photo')
    }
  }

  const handlePhotoDialogClose = () => {
    setPhotoDialogOpen(false)
    setSelectedFile(null)
    setPreviewUrl('')
  }

  if (restaurantLoading) {
    return <LoadingSpinner message="Loading restaurant dashboard..." />
  }

  if (!restaurant) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">
          Your application has been submitted successfully.
We’re currently waiting for restaurant approval. Please check back soon or contact support if the approval takes longer than expected.
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Row 1: Restaurant Profile Card (Full Width) */}
        <Card sx={{ mb: 4, border: restaurant.isOpen ? '2px solid #4caf50' : '2px solid #f44336' }}>
          <CardContent sx={{ p: 4 }}>
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={8}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: 2,
                      position: 'relative',
                      overflow: 'hidden',
                      flexShrink: 0,
                      background: restaurant.documents?.restaurantPhoto ? 'transparent' : 'linear-gradient(135deg, #f97316, #ea580c)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2rem',
                      '&:hover .photo-update-overlay': {
                        opacity: 1,
                      },
                    }}
                  >
                    {restaurant.documents?.restaurantPhoto ? (
                      <img
                        src={restaurant.documents.restaurantPhoto}
                        alt={restaurant.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      '🍽️'
                    )}
                    
                    {/* Update Photo Overlay */}
                    <Box
                      className="photo-update-overlay"
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0,
                        transition: 'opacity 0.2s ease',
                        cursor: 'pointer',
                      }}
                      onClick={() => setPhotoDialogOpen(true)}
                    >
                      <CameraIcon 
                        style={{ 
                          width: 24, 
                          height: 24, 
                          color: 'white' 
                        }} 
                      />
                    </Box>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
                      {restaurant.name}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                      {restaurant.address?.street}, {restaurant.address?.city} - {restaurant.address?.pincode}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {restaurant.cuisine?.map((cuisine) => (
                        <Chip key={cuisine} label={cuisine} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip
                      label={restaurant.status === 'approved' ? 'Live' : restaurant.status}
                      color={restaurant.status === 'approved' ? 'success' : 'warning'}
                      variant="filled"
                      sx={{ fontSize: '0.875rem', px: 2, py: 1 }}
                    />
                    <Chip
                      icon={<BuildingStorefrontIcon className="h-4 w-4" />}
                      label={restaurant.isOpen ? 'Open' : 'Closed'}
                      color={restaurant.isOpen ? 'success' : 'error'}
                      variant="filled"
                      sx={{ fontSize: '0.875rem', px: 2, py: 1 }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<ClockIcon className="h-4 w-4" />}
                      onClick={() => {
                        setOperatingHours(restaurant.operatingHours || { open: '09:00', close: '22:00' })
                        setHoursDialogOpen(true)
                      }}
                    >
                      Set Hours
                    </Button>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={restaurant.isOpen || false}
                          onChange={(e) => handleStatusToggle(e.target.checked)}
                          disabled={updateRestaurantStatusMutation.isPending}
                        />
                      }
                      label={restaurant.isOpen ? 'Open' : 'Closed'}
                      labelPlacement="start"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'right' }}>
                    Operating hours: {restaurant.operatingHours?.open || '09:00'} - {restaurant.operatingHours?.close || '22:00'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Row 2: Professional Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              height: '100%',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1, fontWeight: 500 }}>
                      Orders Today
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1 }}>
                      {todayOrders.length}
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: 2, 
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <ShoppingBagIcon className="h-5 w-5" />
                  </Box>
                </Box>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {todayOrders.length > 0 ? '+' + Math.round((todayOrders.length / (orders?.length || 1)) * 100) + '% of total' : 'No orders yet today'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              height: '100%',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1, fontWeight: 500 }}>
                      Revenue Today
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1 }}>
                      ₹{todayRevenue.toLocaleString()}
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: 2, 
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <CurrencyRupeeIcon className="h-5 w-5" />
                  </Box>
                </Box>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {todayRevenue > 0 ? 'Avg ₹' + Math.round(todayRevenue / todayOrders.length) + ' per order' : 'No revenue today'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              height: '100%',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1, fontWeight: 500 }}>
                      Pending Orders
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1, color: pendingOrders.length > 0 ? '#fff' : 'rgba(255,255,255,0.8)' }}>
                      {pendingOrders.length}
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: 2, 
                    backgroundColor: pendingOrders.length > 0 ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <ClockIcon className="h-5 w-5" />
                  </Box>
                </Box>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {pendingOrders.length > 0 ? 'Requires attention' : 'All orders processed'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              component={Link}
              to="/admin/reviews"
              sx={{ 
                height: '100%',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                textDecoration: 'none',
                cursor: 'pointer',
                display: 'block !important',
                visibility: 'visible !important',
                opacity: '1 !important',
                zIndex: 1,
                border: '1px solid rgba(139, 92, 246, 0.3)',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.2)',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(139, 92, 246, 0.3)',
                },
                transition: 'all 0.3s ease'
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1, fontWeight: 500 }}>
                      Average Rating
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1 }}>
                      {restaurant?.averageRating?.toFixed(1) || '0.0'}
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: 2, 
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <StarIcon 
                      className="h-5 w-5" 
                      style={{ 
                        color: 'white',
                        display: 'block'
                      }} 
                    />
                  </Box>
                </Box>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {restaurant?.totalRatingCount ? `Based on ${restaurant.totalRatingCount} reviews` : 'No reviews yet'}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.7, mt: 1, display: 'block' }}>
                  Click to view all reviews →
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Row 3: Quick Actions & Restaurant Insights */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: 2, 
                    backgroundColor: 'primary.main',
                    color: 'white'
                  }}>
                    <CogIcon className="h-5 w-5" />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Quick Actions
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    component={Link}
                    to="/admin/menu"
                    variant="contained"
                    startIcon={<PlusIcon className="h-5 w-5" />}
                    fullWidth
                    sx={{ 
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 600,
                      textTransform: 'none'
                    }}
                  >
                    Manage Menu Items
                  </Button>
                  <Button
                    component={Link}
                    to="/admin/orders"
                    variant="outlined"
                    startIcon={<EyeIcon className="h-5 w-5" />}
                    fullWidth
                    sx={{ 
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 600,
                      textTransform: 'none'
                    }}
                  >
                    View All Orders
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: 2, 
                    backgroundColor: 'success.main',
                    color: 'white'
                  }}>
                    <ChartBarIcon className="h-5 w-5" />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Restaurant Insights
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Menu Items
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {restaurant.menuItems?.length || 0}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {restaurant.menuItems?.length > 10 ? 'Great variety!' : restaurant.menuItems?.length > 5 ? 'Good selection' : 'Consider adding more items'}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Total Orders
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {orders?.length || 0}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {orders?.length > 50 ? 'Excellent performance!' : orders?.length > 10 ? 'Growing steadily' : 'Just getting started'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Row 4: Recent Orders Table (Full Width) */}
        <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: 2, 
                    backgroundColor: 'info.main',
                    color: 'white'
                  }}>
                    <ShoppingBagIcon className="h-5 w-5" />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Recent Orders
                  </Typography>
                  {orders?.length > 0 && (
                    <Chip 
                      label={`${orders.length} total`} 
                      size="small" 
                      variant="outlined" 
                    />
                  )}
                </Box>
                <Button
                  component={Link}
                  to="/admin/orders"
                  variant="contained"
                  size="small"
                  startIcon={<EyeIcon className="h-4 w-4" />}
                  sx={{ textTransform: 'none' }}
                >
                  View All Orders
                </Button>
              </Box>
            </Box>

            {ordersLoading ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <LoadingSpinner />
              </Box>
            ) : orders?.length > 0 ? (
              <TableContainer>
                <Table sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'grey.50' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Order ID</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Items</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Time</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orders.slice(0, 8).map((order, index) => (
                      <TableRow 
                        key={order._id}
                        sx={{ 
                          '&:hover': { backgroundColor: 'grey.50' },
                          borderLeft: pendingOrders.some(p => p._id === order._id) ? '4px solid' : 'none',
                          borderLeftColor: 'warning.main'
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                            #{order._id.slice(-8).toUpperCase()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ width: 36, height: 36 }}>
                              {order.user?.name?.charAt(0) || 'U'}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {order.user?.name || 'Customer'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {order.user?.email || 'No email'}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {order.items?.length} items
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.main' }}>
                            ₹{order.totalAmount?.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={order.status}
                            color={getStatusColor(order.status)}
                            size="small"
                            sx={{ fontWeight: 500 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <IconButton 
                            size="small"
                            sx={{ 
                              backgroundColor: 'primary.main',
                              color: 'white',
                              '&:hover': { backgroundColor: 'primary.dark' }
                            }}
                          >
                            <EyeIcon className="h-4 w-4" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Box sx={{ 
                  width: 80, 
                  height: 80, 
                  borderRadius: '50%', 
                  backgroundColor: 'grey.100',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2
                }}>
                  <ShoppingBagIcon className="h-8 w-8 text-gray-400" />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  No orders yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Start promoting your restaurant to get your first orders!
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Photo Update Dialog */}
        <Dialog open={photoDialogOpen} onClose={handlePhotoDialogClose} maxWidth="sm" fullWidth>
          <DialogTitle>Update Restaurant Photo</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              {/* Current Photo */}
              {restaurant.documents?.restaurantPhoto && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Current Photo:</Typography>
                  <Box
                    sx={{
                      width: '100%',
                      height: 200,
                      borderRadius: 2,
                      overflow: 'hidden',
                      border: '1px solid',
                      borderColor: 'grey.300',
                    }}
                  >
                    <img
                      src={restaurant.documents.restaurantPhoto}
                      alt="Current restaurant"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </Box>
                </Box>
              )}

              {/* File Upload */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  {restaurant.documents?.restaurantPhoto ? 'Upload New Photo:' : 'Upload Restaurant Photo:'}
                </Typography>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  style={{ width: '100%', padding: '8px' }}
                />
              </Box>

              {/* Preview */}
              {previewUrl && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Preview:</Typography>
                  <Box
                    sx={{
                      width: '100%',
                      height: 200,
                      borderRadius: 2,
                      overflow: 'hidden',
                      border: '1px solid',
                      borderColor: 'grey.300',
                    }}
                  >
                    <img
                      src={previewUrl}
                      alt="Preview"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </Box>
                </Box>
              )}

              <Alert severity="info" sx={{ mt: 2 }}>
                Upload a high-quality photo of your restaurant. This will be displayed on your restaurant card to attract customers.
                {restaurant.documents?.restaurantPhoto && (
                  <>
                    <br />
                    <strong>Note:</strong> The old photo will be automatically deleted when you upload a new one.
                  </>
                )}
              </Alert>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handlePhotoDialogClose}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handlePhotoUpdate}
              disabled={!selectedFile || uploadRestaurantImageMutation.isPending || updateRestaurantPhotoMutation.isPending}
            >
              {uploadRestaurantImageMutation.isPending || updateRestaurantPhotoMutation.isPending ? (
                <LoadingSpinner size={20} />
              ) : (
                'Update Photo'
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Operating Hours Dialog */}
        <Dialog open={hoursDialogOpen} onClose={() => setHoursDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Set Operating Hours</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Opening Time"
                    type="time"
                    value={operatingHours.open}
                    onChange={(e) => setOperatingHours(prev => ({ ...prev, open: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Closing Time"
                    type="time"
                    value={operatingHours.close}
                    onChange={(e) => setOperatingHours(prev => ({ ...prev, close: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
              <Alert severity="info" sx={{ mt: 2 }}>
                These hours will be displayed to customers and help them know when your restaurant is available for orders.
              </Alert>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setHoursDialogOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleUpdateHours}
              disabled={updateRestaurantStatusMutation.isPending}
            >
              {updateRestaurantStatusMutation.isPending ? <LoadingSpinner size={20} /> : 'Update Hours'}
            </Button>
          </DialogActions>
        </Dialog>
      </motion.div>
    </Container>
  )
}

export default AdminDashboard