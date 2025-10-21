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
          py: { xs: 4, md: 6 },
          mb: 4,
        }}
      >
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Typography 
              variant="h3" 
              component="h1" 
              sx={{ 
                fontWeight: 800, 
                mb: 2,
                fontSize: { xs: '2rem', md: '2.5rem' }
              }}
            >
              What are you craving today? 🍽️
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
              Discover amazing restaurants and get your favorite food delivered in 28 minutes
            </Typography>
            
            {/* Quick Stats */}
            <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#fed7aa' }}>
                  10,000+
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Restaurants
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#fed7aa' }}>
                  28min
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Avg Delivery
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#fed7aa' }}>
                  FREE
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Delivery
                </Typography>
              </Box>
            </Box>
          </motion.div>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pb: 6 }}>
        {/* Cuisine Filter */}
        <Box sx={{ mb: 4 }}>
          <CuisineFilter
            selectedCuisine={selectedCuisine}
            onCuisineChange={setSelectedCuisine}
          />
        </Box>

        {/* Restaurants Section */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
            <Typography 
              variant="h4" 
              component="h2" 
              sx={{ 
                fontWeight: 700,
                fontSize: { xs: '1.5rem', md: '2rem' }
              }}
            >
              Restaurants Near You
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {filteredRestaurants?.length || 0} restaurants found
            </Typography>
          </Box>

        {isLoading ? (
          <Grid container spacing={3}>
            {[...Array(6)].map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
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
            <Grid container spacing={3}>
              {filteredRestaurants?.map((restaurant, index) => (
                <Grid item xs={12} sm={6} md={4} key={restaurant._id}>
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