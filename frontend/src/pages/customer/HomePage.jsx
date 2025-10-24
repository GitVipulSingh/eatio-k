import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Skeleton,
} from '@mui/material'

import { useRestaurants } from '../../client/api/queries'
import RestaurantCard from '../../client/components/restaurant/RestaurantCard'
import CuisineFilter from '../../client/components/home/CuisineFilter'

const HomePage = () => {
  const { data: restaurants, isLoading, error } = useRestaurants()
  const [selectedCuisine, setSelectedCuisine] = useState('all')

  const filteredRestaurants = restaurants?.filter(restaurant => {
    if (selectedCuisine === 'all') return true
    return restaurant.cuisine?.includes(selectedCuisine)
  })

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box textAlign="center">
          <Typography variant="h6" color="error">
            Failed to load restaurants. Please try again later.
          </Typography>
        </Box>
      </Container>
    )
  }

  return (
    <Box>
      {/* Hero Banner */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
          color: 'white',
          py: 4,
          mb: 4,
        }}
      >
        <Container maxWidth="lg">
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 700, 
              mb: 1,
              fontSize: { xs: '1.5rem', md: '2rem' }
            }}
          >
            What are you craving today?
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Order from 10,000+ restaurants • Fast delivery • Free above ₹199
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pb: { xs: 4, sm: 6 }, px: { xs: 2, sm: 3 } }}>
        {/* Why Choose Us Section */}
        <Box sx={{ mb: { xs: 4, sm: 6 } }}>
          <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={4}>
              <Box textAlign="center">
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    backgroundColor: 'primary.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <Typography variant="h3">🚀</Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Fast Delivery
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Get your food delivered in 30 minutes or less
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box textAlign="center">
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    backgroundColor: 'primary.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <Typography variant="h3">⭐</Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Quality Food
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Fresh ingredients from top-rated restaurants
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box textAlign="center">
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    backgroundColor: 'primary.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <Typography variant="h3">💳</Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Easy Payment
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Multiple payment options for your convenience
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Cuisine Filter */}
        <Box sx={{ mb: { xs: 4, sm: 6 } }}>
          <CuisineFilter
            selectedCuisine={selectedCuisine}
            onCuisineChange={setSelectedCuisine}
          />
        </Box>

        {/* Popular Restaurants Section */}
        <Box>
          <Box sx={{ mb: { xs: 3, sm: 4 }, textAlign: 'center' }}>
            <Typography 
              variant="h4" 
              component="h2" 
              sx={{ 
                fontWeight: 700,
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                mb: 1
              }}
            >
              Popular Restaurants
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ 
                fontSize: { xs: '0.9rem', sm: '1rem' },
                mb: 2
              }}
            >
              Discover amazing food and restaurants around you
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
            >
              {filteredRestaurants?.length || 0} restaurants found
            </Typography>
          </Box>

        {isLoading ? (
          <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
            {[...Array(8)].map((_, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                <Card>
                  <Skeleton variant="rectangular" height={160} />
                  <CardContent>
                    <Skeleton variant="text" height={24} />
                    <Skeleton variant="text" height={20} />
                    <Skeleton variant="text" height={20} width="60%" />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
              {filteredRestaurants?.map((restaurant, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={restaurant._id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <RestaurantCard restaurant={restaurant} />
                  </motion.div>
                </Grid>
              ))}
            </Grid>

            {filteredRestaurants?.length === 0 && (
              <Box textAlign="center" sx={{ py: 8 }}>
                <Typography variant="h6" color="text.secondary">
                  No restaurants found for the selected cuisine.
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => setSelectedCuisine('all')}
                  sx={{ mt: 2 }}
                >
                  Show All Restaurants
                </Button>
              </Box>
            )}
          </motion.div>
        )}
        </Box>
      </Container>
    </Box>
  )
}

export default HomePage