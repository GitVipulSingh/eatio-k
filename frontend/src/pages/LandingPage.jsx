import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Skeleton,
  Chip,
} from '@mui/material'
import {
  StarIcon,
  ClockIcon,
  ShieldCheckIcon,
  SparklesIcon,
  HeartIcon,
} from '@heroicons/react/24/outline'

import { useRestaurants } from '../client/api/queries'
import RestaurantCard from '../client/components/restaurant/RestaurantCard'
import CuisineFilter from '../client/components/home/CuisineFilter'

const LandingPage = () => {
  const { data: restaurants, isLoading } = useRestaurants()
  const [selectedCuisine, setSelectedCuisine] = useState('all')

  const filteredRestaurants = restaurants?.filter(restaurant => {
    if (selectedCuisine === 'all') return true
    return restaurant.cuisine?.includes(selectedCuisine)
  })

  const features = [
    {
      icon: <ClockIcon className="h-6 w-6" />,
      title: 'Lightning Fast',
      description: 'Average delivery in 28 minutes',
      color: '#10b981'
    },
    {
      icon: <StarIcon className="h-6 w-6" />,
      title: 'Top Rated',
      description: '4.8★ average restaurant rating',
      color: '#f59e0b'
    },
    {
      icon: <ShieldCheckIcon className="h-6 w-6" />,
      title: 'Safe & Secure',
      description: '100% secure payments',
      color: '#3b82f6'
    },
    {
      icon: <HeartIcon className="h-6 w-6" />,
      title: 'Customer Love',
      description: '2M+ happy customers',
      color: '#ef4444'
    }
  ]

  return (
    <div>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
          color: 'white',
          py: { xs: 4, md: 6 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background Pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                {/* Trust Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Box sx={{ display: 'flex', justifyContent: { xs: 'center', sm: 'flex-start' }, mb: 3 }}>
                    <Chip
                      icon={<SparklesIcon className="h-3 w-3" />}
                      label="India's #1 Food Delivery App"
                      sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        color: 'white',
                        fontWeight: 500,
                        backdropFilter: 'blur(10px)',
                        fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' },
                        height: { xs: 26, sm: 30, md: 32 },
                        maxWidth: { xs: '280px', sm: 'none' },
                        '& .MuiChip-label': {
                          px: { xs: 1, sm: 1.5 },
                          fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' },
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        },
                        '& .MuiChip-icon': {
                          fontSize: { xs: '0.8rem', sm: '1rem' },
                          marginLeft: { xs: '4px', sm: '8px' }
                        }
                      }}
                    />
                  </Box>
                </motion.div>

                <Typography
                  variant="h4"
                  component="h1"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                    lineHeight: 1.2,
                    fontSize: { xs: '1.8rem', md: '2.2rem' }
                  }}
                >
                  Order food online from your favorite restaurants
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    mb: 3,
                    opacity: 0.9,
                    fontSize: { xs: '1rem', md: '1.1rem' }
                  }}
                >
                  Fast delivery • 10,000+ restaurants • 50+ cities
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                  <Button
                    component={Link}
                    to="/auth/register/customer"
                    variant="contained"
                    size="large"
                    sx={{
                      background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
                      color: 'primary.main',
                      fontWeight: 700,
                      px: 4,
                      py: 1.5,
                      borderRadius: 3,
                      fontSize: '1.1rem',
                      textTransform: 'none',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                      border: '2px solid rgba(255,255,255,0.8)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                        boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    🍽️ Start Ordering Now
                  </Button>
                </Box>
              </motion.div>
            </Grid>


          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography 
            variant="h4" 
            component="h2" 
            sx={{ 
              fontWeight: 700, 
              mb: 2,
            }}
          >
            Why choose us?
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {features.map((feature, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    backgroundColor: `${feature.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                    color: feature.color,
                  }}
                >
                  {feature.icon}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, fontSize: '1rem' }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                  {feature.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Restaurants Preview Section */}
      <Box sx={{ backgroundColor: 'grey.50', py: { xs: 4, sm: 6, md: 8 } }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
          <Box sx={{ textAlign: 'center', mb: { xs: 4, sm: 6 } }}>
            <Typography 
              variant="h3" 
              component="h2" 
              sx={{ 
                fontWeight: 600, 
                mb: 2,
                fontSize: { xs: '1.75rem', sm: '2.125rem', md: '3rem' }
              }}
            >
              Popular Restaurants
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary" 
              sx={{ 
                mb: 4,
                fontSize: { xs: '1rem', sm: '1.25rem' },
                px: { xs: 1, sm: 0 }
              }}
            >
              Discover amazing food from top-rated restaurants
            </Typography>

            {/* Cuisine Filter */}
            <CuisineFilter
              selectedCuisine={selectedCuisine}
              onCuisineChange={setSelectedCuisine}
            />
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
            <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
              {filteredRestaurants?.slice(0, 8).map((restaurant, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={restaurant._id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <RestaurantCard restaurant={restaurant} />
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          )}

          <Box sx={{ textAlign: 'center', mt: 4, px: { xs: 2, sm: 0 } }}>
            <Button
              component={Link}
              to="/auth/register/customer"
              variant="contained"
              size="large"
              sx={{ 
                width: { xs: '100%', sm: 'auto' },
                px: { xs: 3, sm: 4 },
                py: { xs: 1.5, sm: 1 },
                fontSize: { xs: '1rem', sm: '0.875rem' }
              }}
            >
              Sign Up to See All Restaurants
            </Button>
          </Box>
        </Container>
      </Box>




    </div>
  )
}

export default LandingPage