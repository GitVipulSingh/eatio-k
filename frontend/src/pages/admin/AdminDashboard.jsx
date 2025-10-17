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
  LinearProgress,
  Alert,
  IconButton,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material'
import {
  PlusIcon,
  EyeIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  StarIcon,
  ShoppingBagIcon,
  BuildingStorefrontIcon,
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

import { 
  useMyRestaurant, 
  useRestaurantOrders, 
  useUpdateRestaurantOpenStatus 
} from '../../client/api/queries'
import LoadingSpinner from '../../common/components/LoadingSpinner'

const AdminDashboard = () => {
  const [hoursDialogOpen, setHoursDialogOpen] = useState(false)
  const [operatingHours, setOperatingHours] = useState({ open: '09:00', close: '22:00' })

  const { data: restaurant, isLoading: restaurantLoading, refetch } = useMyRestaurant()
  const { data: orders, isLoading: ordersLoading } = useRestaurantOrders()
  const updateRestaurantStatusMutation = useUpdateRestaurantOpenStatus()

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

  if (restaurantLoading) {
    return <LoadingSpinner message="Loading restaurant dashboard..." />
  }

  if (!restaurant) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">
          Restaurant not found. Please contact support if this issue persists.
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
                {restaurant.name}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {restaurant.address?.street}, {restaurant.address?.city} - {restaurant.address?.pincode}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                {restaurant.cuisine?.map((cuisine) => (
                  <Chip key={cuisine} label={cuisine} size="small" variant="outlined" />
                ))}
              </Box>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
              <Chip
                label={restaurant.status === 'approved' ? 'Live' : restaurant.status}
                color={restaurant.status === 'approved' ? 'success' : 'warning'}
                variant="filled"
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BuildingStorefrontIcon className="h-4 w-4" />
                <Chip
                  label={restaurant.isOpen ? 'Open' : 'Closed'}
                  color={restaurant.isOpen ? 'success' : 'error'}
                  variant="filled"
                  size="small"
                />
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Restaurant Status Control */}
        <Card sx={{ mb: 4, border: restaurant.isOpen ? '2px solid #4caf50' : '2px solid #f44336' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Restaurant Status
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {restaurant.isOpen 
                    ? `Currently open • Operating hours: ${restaurant.operatingHours?.open || '09:00'} - ${restaurant.operatingHours?.close || '22:00'}`
                    : 'Currently closed • Customers cannot place orders'
                  }
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                  variant="outlined"
                  size="small"
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
            </Box>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                  <ShoppingBagIcon className="h-8 w-8 text-blue-500" />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {todayOrders.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Orders Today
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                  <CurrencyRupeeIcon className="h-8 w-8 text-green-500" />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                  ₹{todayRevenue.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Revenue Today
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                  <ClockIcon className="h-8 w-8 text-orange-500" />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                  {pendingOrders.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending Orders
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                  <StarIcon className="h-8 w-8 text-yellow-500" />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                  {restaurant.averageRating?.toFixed(1) || '0.0'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Average Rating
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    component={Link}
                    to="/admin/menu"
                    variant="contained"
                    startIcon={<PlusIcon className="h-4 w-4" />}
                    fullWidth
                  >
                    Manage Menu
                  </Button>
                  <Button
                    component={Link}
                    to="/admin/orders"
                    variant="outlined"
                    startIcon={<EyeIcon className="h-4 w-4" />}
                    fullWidth
                  >
                    View All Orders
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Restaurant Status
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Menu Items: {restaurant.menuItems?.length || 0}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min((restaurant.menuItems?.length || 0) * 10, 100)}
                    sx={{ mb: 2 }}
                  />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Total Orders: {orders?.length || 0}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min((orders?.length || 0) * 2, 100)}
                    color="success"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Recent Orders */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Recent Orders
              </Typography>
              <Button
                component={Link}
                to="/admin/orders"
                variant="outlined"
                size="small"
              >
                View All
              </Button>
            </Box>

            {ordersLoading ? (
              <LoadingSpinner />
            ) : orders?.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Order ID</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Items</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orders.slice(0, 5).map((order) => (
                      <TableRow key={order._id}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            #{order._id.slice(-8).toUpperCase()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 32, height: 32 }}>
                              {order.user?.name?.charAt(0) || 'U'}
                            </Avatar>
                            <Typography variant="body2">
                              {order.user?.name || 'Customer'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {order.items?.length} items
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            ₹{order.totalAmount}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={order.status}
                            color={getStatusColor(order.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(order.createdAt).toLocaleTimeString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <IconButton size="small">
                            <EyeIcon className="h-4 w-4" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No orders yet. Start promoting your restaurant to get orders!
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

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