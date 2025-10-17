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
  Paper,
  Chip,
  Avatar,
  LinearProgress,
  Alert,
  Skeleton,
} from '@mui/material'
import {
  BuildingStorefrontIcon,
  UsersIcon,
  CurrencyRupeeIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  ClockIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline'

import { 
  usePendingRestaurants, 
  useSystemStats, 
  useAllRestaurants, 
  useAllUsers, 
  useAllOrders 
} from '../../client/api/queries'
import LoadingSpinner from '../../common/components/LoadingSpinner'

const SuperAdminDashboard = () => {
  const { data: pendingRestaurants, isLoading: pendingLoading } = usePendingRestaurants()
  const { data: systemStats, isLoading: statsLoading } = useSystemStats()
  const { data: allRestaurants, isLoading: restaurantsLoading } = useAllRestaurants()
  const { data: allUsers, isLoading: usersLoading } = useAllUsers()
  const { data: allOrders, isLoading: ordersLoading } = useAllOrders()

  const isLoading = statsLoading || pendingLoading

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
            Super Admin Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage the entire Eatio platform and approve new restaurants
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                  <BuildingStorefrontIcon className="h-8 w-8 text-blue-500" />
                </Box>
                {statsLoading ? (
                  <Skeleton variant="text" width={60} height={40} sx={{ mx: 'auto' }} />
                ) : (
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {systemStats?.totalRestaurants || 0}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  Total Restaurants
                </Typography>
                {!statsLoading && (
                  <Typography variant="caption" color="success.main">
                    {systemStats?.activeRestaurants || 0} active
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                  <ExclamationTriangleIcon className="h-8 w-8 text-orange-500" />
                </Box>
                {statsLoading ? (
                  <Skeleton variant="text" width={60} height={40} sx={{ mx: 'auto' }} />
                ) : (
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                    {systemStats?.pendingApprovals || 0}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  Pending Approvals
                </Typography>
                {!statsLoading && systemStats?.pendingApprovals > 0 && (
                  <Typography variant="caption" color="warning.main">
                    Requires attention
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                  <UsersIcon className="h-8 w-8 text-green-500" />
                </Box>
                {statsLoading ? (
                  <Skeleton variant="text" width={60} height={40} sx={{ mx: 'auto' }} />
                ) : (
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                    {systemStats?.totalUsers?.toLocaleString() || 0}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  Total Users
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                  <CurrencyRupeeIcon className="h-8 w-8 text-purple-500" />
                </Box>
                {statsLoading ? (
                  <Skeleton variant="text" width={60} height={40} sx={{ mx: 'auto' }} />
                ) : (
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                    ₹{systemStats?.totalRevenue ? (systemStats.totalRevenue / 100000).toFixed(1) + 'L' : '0'}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  Total Revenue
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Additional Stats Row */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                  <ShoppingBagIcon className="h-8 w-8 text-indigo-500" />
                </Box>
                {statsLoading ? (
                  <Skeleton variant="text" width={60} height={40} sx={{ mx: 'auto' }} />
                ) : (
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                    {systemStats?.totalOrders || 0}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  Total Orders
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                  <ClockIcon className="h-8 w-8 text-teal-500" />
                </Box>
                {statsLoading ? (
                  <Skeleton variant="text" width={60} height={40} sx={{ mx: 'auto' }} />
                ) : (
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                    {systemStats?.todayOrders || 0}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  Today's Orders
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                  <ChartBarIcon className="h-8 w-8 text-pink-500" />
                </Box>
                {statsLoading ? (
                  <Skeleton variant="text" width={60} height={40} sx={{ mx: 'auto' }} />
                ) : (
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'error.main' }}>
                    {systemStats?.recentActivity?.orders || 0}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  Orders (7 days)
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                  <BuildingStorefrontIcon className="h-8 w-8 text-amber-500" />
                </Box>
                {statsLoading ? (
                  <Skeleton variant="text" width={60} height={40} sx={{ mx: 'auto' }} />
                ) : (
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                    {systemStats?.recentActivity?.registrations || 0}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  New Restaurants (7 days)
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
                    to="/super-admin/restaurants"
                    variant="contained"
                    color="warning"
                    startIcon={<ExclamationTriangleIcon className="h-4 w-4" />}
                    fullWidth
                  >
                    Review Pending Restaurants ({systemStats?.pendingApprovals || 0})
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ChartBarIcon className="h-4 w-4" />}
                    fullWidth
                    disabled
                  >
                    View Analytics (Coming Soon)
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Today's Overview
                </Typography>
                {statsLoading ? (
                  <Box>
                    <Skeleton variant="text" width="100%" height={20} />
                    <Skeleton variant="rectangular" width="100%" height={8} sx={{ mb: 2 }} />
                    <Skeleton variant="text" width="100%" height={20} />
                    <Skeleton variant="rectangular" width="100%" height={8} />
                  </Box>
                ) : (
                  <>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Orders Today
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {systemStats?.todayOrders || 0}
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={Math.min((systemStats?.todayOrders || 0), 100)} 
                        sx={{ mb: 2 }}
                      />
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Active Restaurants
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {systemStats?.activeRestaurants || 0}/{systemStats?.totalRestaurants || 0}
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={systemStats?.totalRestaurants ? 
                          (systemStats.activeRestaurants / systemStats.totalRestaurants) * 100 : 0
                        } 
                        color="success"
                      />
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Pending Restaurants Preview */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Pending Restaurant Approvals
              </Typography>
              <Button
                component={Link}
                to="/super-admin/restaurants"
                variant="outlined"
                size="small"
              >
                View All
              </Button>
            </Box>

            {pendingLoading ? (
              <LoadingSpinner />
            ) : pendingRestaurants?.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Restaurant</TableCell>
                      <TableCell>Owner Details</TableCell>
                      <TableCell>Contact</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell>FSSAI License</TableCell>
                      <TableCell>Cuisine</TableCell>
                      <TableCell>Applied</TableCell>
                      <TableCell>Documents</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pendingRestaurants.slice(0, 5).map((restaurant) => (
                      <TableRow key={restaurant._id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 32, height: 32 }}>
                              🍽️
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {restaurant.name}
                              </Typography>
                              {restaurant.description && (
                                <Typography variant="caption" color="text.secondary">
                                  {restaurant.description.substring(0, 30)}...
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {restaurant.owner?.name || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              📧 {restaurant.owner?.email || 'N/A'}
                            </Typography>
                            <br />
                            <Typography variant="caption" color="text.secondary">
                              📱 {restaurant.owner?.phone || 'N/A'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {restaurant.address?.street && `${restaurant.address.street}, `}
                            {restaurant.address?.city}, {restaurant.address?.state}
                            <br />
                            <Typography variant="caption">
                              📍 {restaurant.address?.pincode}
                            </Typography>
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                            {restaurant.fssaiLicenseNumber}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {restaurant.cuisine?.slice(0, 2).map((cuisine) => (
                              <Chip key={cuisine} label={cuisine} size="small" variant="outlined" />
                            ))}
                            {restaurant.cuisine?.length > 2 && (
                              <Chip label={`+${restaurant.cuisine.length - 2}`} size="small" variant="outlined" />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(restaurant.createdAt).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box>
                            {restaurant.documents?.fssaiLicense ? (
                              <Box sx={{ mb: 0.5 }}>
                                <Chip 
                                  label="FSSAI License" 
                                  size="small" 
                                  color="success" 
                                  variant="outlined" 
                                  sx={{ mr: 0.5 }}
                                  onClick={() => {
                                    // For now, show the filename in an alert
                                    // In production, this would open/download the file
                                    alert(`FSSAI License: ${restaurant.documents.fssaiLicense}\n\nNote: File viewing requires file storage service setup.`)
                                  }}
                                  style={{ cursor: 'pointer' }}
                                />
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                  📄 {restaurant.documents.fssaiLicense}
                                </Typography>
                              </Box>
                            ) : (
                              <Typography variant="caption" color="error.main" sx={{ display: 'block', mb: 0.5 }}>
                                ❌ No FSSAI License
                              </Typography>
                            )}
                            
                            {restaurant.documents?.restaurantPhoto ? (
                              <Box sx={{ mb: 0.5 }}>
                                <Chip 
                                  label="Restaurant Photo" 
                                  size="small" 
                                  color="info" 
                                  variant="outlined" 
                                  sx={{ mr: 0.5 }}
                                  onClick={() => {
                                    // For now, show the filename in an alert
                                    // In production, this would open/download the file
                                    alert(`Restaurant Photo: ${restaurant.documents.restaurantPhoto}\n\nNote: File viewing requires file storage service setup.`)
                                  }}
                                  style={{ cursor: 'pointer' }}
                                />
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                  🖼️ {restaurant.documents.restaurantPhoto}
                                </Typography>
                              </Box>
                            ) : (
                              <Typography variant="caption" color="error.main" sx={{ display: 'block', mb: 0.5 }}>
                                ❌ No Restaurant Photo
                              </Typography>
                            )}
                            
                            {(!restaurant.documents?.fssaiLicense && !restaurant.documents?.restaurantPhoto) && (
                              <Typography variant="caption" color="error.main">
                                ❌ No documents uploaded
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No pending restaurant applications
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity Summary */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Recent Restaurants
                </Typography>
                {restaurantsLoading ? (
                  <Box>
                    {[...Array(3)].map((_, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Skeleton variant="circular" width={32} height={32} />
                        <Box sx={{ flex: 1 }}>
                          <Skeleton variant="text" width="60%" />
                          <Skeleton variant="text" width="40%" />
                        </Box>
                      </Box>
                    ))}
                  </Box>
                ) : allRestaurants?.length > 0 ? (
                  <Box>
                    {allRestaurants.slice(0, 5).map((restaurant) => (
                      <Box key={restaurant._id} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          🍽️
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {restaurant.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {restaurant.address?.city} • {new Date(restaurant.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Chip 
                          label={restaurant.status} 
                          size="small" 
                          color={restaurant.status === 'approved' ? 'success' : 'warning'}
                          variant="outlined"
                        />
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No restaurants found
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Recent Users
                </Typography>
                {usersLoading ? (
                  <Box>
                    {[...Array(3)].map((_, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Skeleton variant="circular" width={32} height={32} />
                        <Box sx={{ flex: 1 }}>
                          <Skeleton variant="text" width="60%" />
                          <Skeleton variant="text" width="40%" />
                        </Box>
                      </Box>
                    ))}
                  </Box>
                ) : allUsers?.length > 0 ? (
                  <Box>
                    {allUsers.slice(0, 5).map((user) => (
                      <Box key={user._id} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {user.name?.charAt(0) || 'U'}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {user.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user.email} • {new Date(user.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Chip 
                          label={user.role} 
                          size="small" 
                          color={user.role === 'admin' ? 'primary' : 'default'}
                          variant="outlined"
                        />
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No users found
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </motion.div>
    </Container>
  )
}

export default SuperAdminDashboard