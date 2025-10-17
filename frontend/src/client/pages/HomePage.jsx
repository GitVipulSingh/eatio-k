import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Rating,
  Button,
  Skeleton,
} from '@mui/material'
import { MapPinIcon, ClockIcon } from '@heroicons/react/24/outline'

import { useRestaurants } from '../api/queries'
import RestaurantCard from '../components/restaurant/RestaurantCard'
import HeroSection from '../components/home/HeroSection'
import CuisineFilter from '../components/home/CuisineFilter'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const HomePage = () => {
  const { data: restaurants, isLoading, error } = useRestaurants()
  const [selectedCuisine, setSelectedCuisine] = useState('all')

  const filteredRestaurants = restaurants?.filter(restaurant => {
    if (selectedCuisine === 'all') return true
    return restaurant.cuisine.includes(selectedCuisine)
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
    <div>
      {/* Hero Section */}
      <HeroSection />

      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Cuisine Filter */}
        <CuisineFilter
          selectedCuisine={selectedCuisine}
          onCuisineChange={setSelectedCuisine}
        />

        {/* Restaurants Section */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h4" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
            Restaurants Near You
          </Typography>

          {isLoading ? (
            <Grid container spacing={3}>
              {[...Array(6)].map((_, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card>
                    <Skeleton variant="rectangular" height={200} />
                    <CardContent>
                      <Skeleton variant="text" height={32} />
                      <Skeleton variant="text" height={24} />
                      <Skeleton variant="text" height={24} width="60%" />
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
    </div>
  )
}

export default HomePage