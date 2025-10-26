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
  Paper,
  Chip,
  Avatar,
  LinearProgress,
  Alert,
  Skeleton,
  Divider,
} from '@mui/material'
import {
  BuildingStorefrontIcon,
  UsersIcon,
  CurrencyRupeeIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  ClockIcon,
  ShoppingBagIcon,
  CogIcon,
  EyeIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline'

import { 
  usePendingRestaurants, 
  useSystemStats, 
  useAllRestaurants, 
  useAllUsers, 
  useAllOrders 
} from '../../client/api/queries'
import LoadingSpinner from '../../common/components/LoadingSpinner'
import { useSuperAdminDashboardUpdates } from '../../hooks/useRealTimeUpdates'
import SuperAdminLoginPrompt from '../../components/SuperAdminLoginPrompt'
import DocumentViewer from '../../components/DocumentViewer'

const SuperAdminDashboard = () => {
  const [documentViewer, setDocumentViewer] = useState({ open: false, url: '', name: '', type: '' })
  
  const { data: pendingRestaurants, isLoading: pendingLoading, error: pendingError } = usePendingRestaurants()
  const { data: systemStats, isLoading: statsLoading, error: statsError } = useSystemStats()
  const { data: allRestaurants, isLoading: restaurantsLoading, error: restaurantsError } = useAllRestaurants()
  const { data: allUsers, isLoading: usersLoading, error: usersError } = useAllUsers()
  const { data: allOrders, isLoading: ordersLoading, error: ordersError } = useAllOrders()

  // Enable real-time updates for Super Admin dashboard
  useSuperAdminDashboardUpdates()

  const isLoading = statsLoading || pendingLoading

  // Check for 403 errors (not authorized as superadmin)
  const hasAuthError = [pendingError, statsError, restaurantsError, usersError, ordersError]
    .some(error => error?.response?.status === 403)

  // Helper function to open document viewer
  const openDocumentViewer = (url, name, type) => {
    setDocumentViewer({ open: true, url, name, type })
  }

  const closeDocumentViewer = () => {
    setDocumentViewer({ open: false, url: '', name: '', type: '' })
  }

  if (hasAuthError) {
    return <SuperAdminLoginPrompt />
  }

  return (
    <>
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
            Super Admin Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage the entire Eatio platform and approve new restaurants
          </Typography>
        </Box>

        {/* Row 1: Professional Stats Cards (4-Column Grid) */}
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <BuildingStorefrontIcon className="h-4 w-4" />
                      <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                        Total Restaurants
                      </Typography>
                    </Box>
                    {statsLoading ? (
                      <Skeleton variant="text" width={80} height={48} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
                    ) : (
                      <Typography variant="h2" sx={{ fontWeight: 800, lineHeight: 1 }}>
                        {systemStats?.totalRestaurants || 0}
                      </Typography>
                    )}
                  </Box>
                </Box>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {!statsLoading && `${systemStats?.activeRestaurants || 0} active restaurants`}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              height: '100%',
              background: systemStats?.pendingApprovals > 0 
                ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <ExclamationTriangleIcon className="h-4 w-4" />
                      <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                        Pending Approvals
                      </Typography>
                    </Box>
                    {statsLoading ? (
                      <Skeleton variant="text" width={80} height={48} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
                    ) : (
                      <Typography variant="h2" sx={{ fontWeight: 800, lineHeight: 1 }}>
                        {systemStats?.pendingApprovals || 0}
                      </Typography>
                    )}
                  </Box>
                </Box>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {!statsLoading && (systemStats?.pendingApprovals > 0 ? 'Requires immediate attention' : 'All applications processed')}
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <UsersIcon className="h-4 w-4" />
                      <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                        Total Users
                      </Typography>
                    </Box>
                    {statsLoading ? (
                      <Skeleton variant="text" width={80} height={48} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
                    ) : (
                      <Typography variant="h2" sx={{ fontWeight: 800, lineHeight: 1 }}>
                        {systemStats?.totalUsers?.toLocaleString() || 0}
                      </Typography>
                    )}
                  </Box>
                </Box>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Platform user base
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              height: '100%',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <CurrencyRupeeIcon className="h-4 w-4" />
                      <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                        Total Revenue
                      </Typography>
                    </Box>
                    {statsLoading ? (
                      <Skeleton variant="text" width={80} height={48} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
                    ) : (
                      <Typography variant="h2" sx={{ fontWeight: 800, lineHeight: 1 }}>
                        ₹{systemStats?.totalRevenue ? 
                          systemStats.totalRevenue >= 100000 
                            ? (systemStats.totalRevenue / 100000).toFixed(1) + 'L'
                            : systemStats.totalRevenue >= 1000
                              ? (systemStats.totalRevenue / 1000).toFixed(1) + 'K'
                              : systemStats.totalRevenue.toFixed(0)
                          : '0'}
                      </Typography>
                    )}
                  </Box>
                </Box>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Platform lifetime revenue
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Row 2: Key Actions & Overview */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: 2, 
                    backgroundColor: 'warning.main',
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
                    to="/super-admin/restaurants"
                    variant="contained"
                    color="warning"
                    startIcon={<ExclamationTriangleIcon className="h-5 w-5" />}
                    fullWidth
                    sx={{ 
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 600,
                      textTransform: 'none'
                    }}
                  >
                    Review Pending Restaurants ({systemStats?.pendingApprovals || 0})
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ChartBarIcon className="h-5 w-5" />}
                    fullWidth
                    disabled
                    sx={{ 
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 600,
                      textTransform: 'none'
                    }}
                  >
                    View Analytics (Coming Soon)
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: 2, 
                    backgroundColor: 'info.main',
                    color: 'white'
                  }}>
                    <CalendarDaysIcon className="h-5 w-5" />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Today's Overview
                  </Typography>
                </Box>
                {statsLoading ? (
                  <Box>
                    <Skeleton variant="text" width="100%" height={20} />
                    <Skeleton variant="rectangular" width="100%" height={8} sx={{ mb: 2 }} />
                    <Skeleton variant="text" width="100%" height={20} />
                    <Skeleton variant="rectangular" width="100%" height={8} />
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Orders Today
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {systemStats?.todayOrders || 0}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {systemStats?.todayOrders > 0 ? 'Active day' : 'Quiet day'}
                      </Typography>
                    </Box>
                    <Divider />
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Active Restaurants
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {systemStats?.activeRestaurants || 0}/{systemStats?.totalRestaurants || 0}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {systemStats?.totalRestaurants ? 
                          `${Math.round((systemStats.activeRestaurants / systemStats.totalRestaurants) * 100)}% active` : 
                          'No restaurants yet'
                        }
                      </Typography>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
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
                    Weekly Activity
                  </Typography>
                </Box>
                {statsLoading ? (
                  <Box>
                    <Skeleton variant="text" width="100%" height={20} />
                    <Skeleton variant="text" width="100%" height={20} />
                    <Skeleton variant="text" width="100%" height={20} />
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Orders (7 days)
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {systemStats?.recentActivity?.orders || 0}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Weekly order volume
                      </Typography>
                    </Box>
                    <Divider />
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          New Restaurants
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {systemStats?.recentActivity?.registrations || 0}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        New registrations this week
                      </Typography>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Row 3: Pending Approvals Section */}
        {pendingLoading || (pendingRestaurants?.length > 0) ? (
          <Card sx={{ mb: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ 
                      p: 1.5, 
                      borderRadius: 2, 
                      backgroundColor: 'warning.main',
                      color: 'white'
                    }}>
                      <ExclamationTriangleIcon className="h-5 w-5" />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Pending Restaurant Approvals
                    </Typography>
                    {pendingRestaurants?.length > 0 && (
                      <Chip 
                        label={`${pendingRestaurants.length} pending`} 
                        size="small" 
                        color="warning"
                        variant="filled"
                      />
                    )}
                  </Box>
                  <Button
                    component={Link}
                    to="/super-admin/restaurants"
                    variant="contained"
                    color="warning"
                    size="small"
                    startIcon={<EyeIcon className="h-4 w-4" />}
                    sx={{ textTransform: 'none' }}
                  >
                    Review All Applications
                  </Button>
                </Box>
              </Box>

              {pendingLoading ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <LoadingSpinner />
                </Box>
              ) : (
                <TableContainer>
                  <Table sx={{ minWidth: 650 }}>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: 'grey.50' }}>
                        <TableCell sx={{ fontWeight: 600 }}>Restaurant</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Owner Details</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Contact</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>FSSAI License</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Cuisine</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Applied</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Documents</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pendingRestaurants.slice(0, 5).map((restaurant) => (
                        <TableRow 
                          key={restaurant._id}
                          sx={{ 
                            '&:hover': { backgroundColor: 'grey.50' },
                            borderLeft: '4px solid',
                            borderLeftColor: 'warning.main'
                          }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar 
                                sx={{ width: 36, height: 36 }}
                                src={restaurant.documents?.restaurantPhoto?.includes('cloudinary.com') ? restaurant.documents.restaurantPhoto : undefined}
                              >
                                {!restaurant.documents?.restaurantPhoto?.includes('cloudinary.com') && '🍽️'}
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
                                    label={restaurant.documents.fssaiLicense.includes('cloudinary.com') ? "FSSAI License (View)" : "FSSAI License (Legacy)"} 
                                    size="small" 
                                    color={restaurant.documents.fssaiLicense.includes('cloudinary.com') ? "success" : "warning"} 
                                    variant="outlined" 
                                    sx={{ mr: 0.5 }}
                                    onClick={() => {
                                      openDocumentViewer(
                                        restaurant.documents.fssaiLicense,
                                        `FSSAI License - ${restaurant.name}`,
                                        'FSSAI License Document'
                                      )
                                    }}
                                    style={{ cursor: 'pointer' }}
                                  />
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
                                      openDocumentViewer(
                                        restaurant.documents.restaurantPhoto,
                                        `Restaurant Photo - ${restaurant.name}`,
                                        'Restaurant Photo'
                                      )
                                    }}
                                    style={{ cursor: 'pointer' }}
                                  />
                                  {restaurant.documents.restaurantPhoto.includes('cloudinary.com') && (
                                    <Box 
                                      component="img" 
                                      src={restaurant.documents.restaurantPhoto} 
                                      alt="Restaurant"
                                      sx={{ 
                                        width: 40, 
                                        height: 40, 
                                        objectFit: 'cover', 
                                        borderRadius: 1, 
                                        mt: 0.5,
                                        border: '1px solid',
                                        borderColor: 'grey.300'
                                      }}
                                    />
                                  )}
                                </Box>
                              ) : (
                                <Typography variant="caption" color="error.main" sx={{ display: 'block', mb: 0.5 }}>
                                  ❌ No Restaurant Photo
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        ) : (
          <Alert severity="info" sx={{ mb: 4 }}>
            <Typography variant="body2">
              No pending restaurant applications at this time.
            </Typography>
          </Alert>
        )}

        {/* Row 4: Recent Activity Lists */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ 
                      p: 1.5, 
                      borderRadius: 2, 
                      backgroundColor: 'primary.main',
                      color: 'white'
                    }}>
                      <BuildingStorefrontIcon className="h-5 w-5" />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Recent Restaurants
                    </Typography>
                    {allRestaurants?.length > 0 && (
                      <Chip 
                        label={`${allRestaurants.length} total`} 
                        size="small" 
                        variant="outlined" 
                      />
                    )}
                  </Box>
                </Box>
                <Box sx={{ p: 3 }}>
                  {restaurantsLoading ? (
                    <Box>
                      {[...Array(5)].map((_, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                          <Skeleton variant="circular" width={40} height={40} />
                          <Box sx={{ flex: 1 }}>
                            <Skeleton variant="text" width="70%" height={20} />
                            <Skeleton variant="text" width="50%" height={16} />
                          </Box>
                          <Skeleton variant="rectangular" width={60} height={24} />
                        </Box>
                      ))}
                    </Box>
                  ) : allRestaurants?.length > 0 ? (
                    <Box>
                      {allRestaurants.slice(0, 6).map((restaurant, index) => (
                        <Box key={restaurant._id} sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 2, 
                          mb: index < 5 ? 3 : 0,
                          p: 1.5,
                          borderRadius: 2,
                          '&:hover': { backgroundColor: 'grey.50' }
                        }}>
                          <Avatar 
                            sx={{ width: 40, height: 40 }}
                            src={restaurant.documents?.restaurantPhoto?.includes('cloudinary.com') ? restaurant.documents.restaurantPhoto : undefined}
                          >
                            {!restaurant.documents?.restaurantPhoto?.includes('cloudinary.com') && '🍽️'}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
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
                            variant="filled"
                            sx={{ fontWeight: 500 }}
                          />
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Box sx={{ 
                        width: 60, 
                        height: 60, 
                        borderRadius: '50%', 
                        backgroundColor: 'grey.100',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2
                      }}>
                        <BuildingStorefrontIcon className="h-6 w-6 text-gray-400" />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        No restaurants found
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ 
                      p: 1.5, 
                      borderRadius: 2, 
                      backgroundColor: 'success.main',
                      color: 'white'
                    }}>
                      <UsersIcon className="h-5 w-5" />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Recent Users
                    </Typography>
                    {allUsers?.length > 0 && (
                      <Chip 
                        label={`${allUsers.length} total`} 
                        size="small" 
                        variant="outlined" 
                      />
                    )}
                  </Box>
                </Box>
                <Box sx={{ p: 3 }}>
                  {usersLoading ? (
                    <Box>
                      {[...Array(5)].map((_, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                          <Skeleton variant="circular" width={40} height={40} />
                          <Box sx={{ flex: 1 }}>
                            <Skeleton variant="text" width="70%" height={20} />
                            <Skeleton variant="text" width="50%" height={16} />
                          </Box>
                          <Skeleton variant="rectangular" width={60} height={24} />
                        </Box>
                      ))}
                    </Box>
                  ) : allUsers?.length > 0 ? (
                    <Box>
                      {allUsers.slice(0, 6).map((user, index) => (
                        <Box key={user._id} sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 2, 
                          mb: index < 5 ? 3 : 0,
                          p: 1.5,
                          borderRadius: 2,
                          '&:hover': { backgroundColor: 'grey.50' }
                        }}>
                          <Avatar sx={{ width: 40, height: 40 }}>
                            {user.name?.charAt(0) || 'U'}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                              {user.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {user.email} • {new Date(user.createdAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                          <Chip 
                            label={user.role} 
                            size="small" 
                            color={user.role === 'admin' ? 'primary' : user.role === 'superadmin' ? 'error' : 'default'}
                            variant="filled"
                            sx={{ fontWeight: 500 }}
                          />
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Box sx={{ 
                        width: 60, 
                        height: 60, 
                        borderRadius: '50%', 
                        backgroundColor: 'grey.100',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2
                      }}>
                        <UsersIcon className="h-6 w-6 text-gray-400" />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        No users found
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </motion.div>
    </Container>
    
    {/* Document Viewer Modal */}
    <DocumentViewer
      open={documentViewer.open}
      onClose={closeDocumentViewer}
      documentUrl={documentViewer.url}
      documentName={documentViewer.name}
      documentType={documentViewer.type}
    />
    </>
  )
}

export default SuperAdminDashboard