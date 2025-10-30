import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Avatar,
  Rating,
  Chip,
  Pagination,
  Alert,
  Paper,
  Divider,
} from '@mui/material'
import {
  StarIcon,
  UserIcon,
  CalendarDaysIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline'
import { StarIcon as StarFilledIcon } from '@heroicons/react/24/solid'

import { useMyRestaurant, useRestaurantReviews } from '../../client/api/queries'
import LoadingSpinner from '../../common/components/LoadingSpinner'

const ReviewsManagement = () => {
  const [page, setPage] = useState(1)
  const limit = 10

  const { data: restaurant, isLoading: restaurantLoading } = useMyRestaurant()
  const { data: reviewsData, isLoading: reviewsLoading } = useRestaurantReviews(
    restaurant?._id,
    {
      enabled: !!restaurant?._id,
      page,
      limit,
    }
  )

  const handlePageChange = (event, newPage) => {
    setPage(newPage)
  }

  if (restaurantLoading) {
    return <LoadingSpinner message="Loading restaurant data..." />
  }

  if (!restaurant) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Restaurant data not found. Please try refreshing the page.
        </Alert>
      </Container>
    )
  }

  const reviews = reviewsData?.reviews || []
  const pagination = reviewsData?.pagination || {}

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
            Customer Reviews
          </Typography>
          <Typography variant="body1" color="text.secondary">
            See what customers are saying about {restaurant.name}
          </Typography>
        </Box>

        {/* Rating Overview */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', textAlign: 'center' }}>
              <CardContent sx={{ py: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <StarFilledIcon style={{ width: '2rem', height: '2rem', color: '#fbbf24' }} />
                  <Typography variant="h3" sx={{ fontWeight: 700, ml: 1 }}>
                    {restaurant.averageRating?.toFixed(1) || '0.0'}
                  </Typography>
                </Box>
                <Rating
                  value={restaurant.averageRating || 0}
                  precision={0.1}
                  readOnly
                  sx={{ mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {restaurant.totalRatingCount ? `Based on ${restaurant.totalRatingCount} reviews` : 'No reviews yet'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', textAlign: 'center' }}>
              <CardContent sx={{ py: 4 }}>
                <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                  {restaurant.totalRatingCount || 0}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                  Total Reviews
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Customer feedback received
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', textAlign: 'center' }}>
              <CardContent sx={{ py: 4 }}>
                <Typography variant="h3" sx={{ fontWeight: 700, color: 'success.main', mb: 1 }}>
                  {restaurant.totalRatingCount ? 
                    Math.round((reviews.filter(r => r.rating >= 4).length / Math.min(reviews.length, 10)) * 100) : 0}%
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                  Positive Reviews
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  4+ star ratings
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Reviews List */}
        {reviewsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <LoadingSpinner message="Loading reviews..." />
          </Box>
        ) : reviews.length === 0 ? (
          <Paper sx={{ p: 8, textAlign: 'center' }}>
            <Box sx={{ fontSize: '4rem', mb: 2 }}>⭐</Box>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              No reviews yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Customer reviews will appear here once orders are delivered and rated
            </Typography>
          </Paper>
        ) : (
          <Box>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Recent Reviews ({pagination.totalReviews || 0})
            </Typography>
            
            <Grid container spacing={3}>
              {reviews.map((review, index) => (
                <Grid item xs={12} key={review._id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card sx={{ 
                      '&:hover': { 
                        boxShadow: 4,
                        transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.3s ease'
                    }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                          {/* User Avatar */}
                          <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}>
                            {review.user?.name?.charAt(0) || 'U'}
                          </Avatar>

                          {/* Review Content */}
                          <Box sx={{ flex: 1 }}>
                            {/* Header */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                              <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                  {review.user?.name || 'Anonymous User'}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                  <Rating value={review.rating} size="small" readOnly />
                                  <Typography variant="body2" color="text.secondary">
                                    {review.rating}/5
                                  </Typography>
                                </Box>
                              </Box>
                              <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <CalendarDaysIcon style={{ width: '0.875rem', height: '0.875rem' }} />
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </Typography>
                              </Box>
                            </Box>

                            {/* Review Comment */}
                            {review.comment && (
                              <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.6 }}>
                                "{review.comment}"
                              </Typography>
                            )}

                            {/* Order Info */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                              <Chip
                                icon={<ShoppingBagIcon style={{ width: '1rem', height: '1rem' }} />}
                                label={`Order #${review.order?.slice(-6) || 'N/A'}`}
                                size="small"
                                variant="outlined"
                                color="primary"
                              />
                              {review.isVerifiedPurchase && (
                                <Chip
                                  label="Verified Purchase"
                                  size="small"
                                  color="success"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={pagination.totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                />
              </Box>
            )}
          </Box>
        )}
      </motion.div>
    </Container>
  )
}

export default ReviewsManagement