import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Skeleton,
  Stack,
  Chip,
} from '@mui/material'
import {
  ArrowRightIcon,
  StarIcon,
  ClockIcon,
  ShieldCheckIcon,
  TruckIcon,
  SparklesIcon,
  HeartIcon,
  GiftIcon,
} from '@heroicons/react/24/outline'

import { useRestaurants } from '../client/api/queries'
import RestaurantCard from '../client/components/restaurant/RestaurantCard'
import CuisineFilter from '../client/components/home/CuisineFilter'

const LandingPage = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
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

  const stats = [
    { number: '10,000+', label: 'Restaurants' },
    { number: '2M+', label: 'Happy Customers' },
    { number: '50+', label: 'Cities' },
    { number: '28min', label: 'Avg Delivery' }
  ]

  return (
    <div>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
          color: 'white',
          py: { xs: 6, md: 10 },
          position: 'relative',
          overflow: 'hidden',
          minHeight: { xs: '70vh', md: '80vh' },
          display: 'flex',
          alignItems: 'center',
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
            <Grid item xs={12} md={6}>
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
                  <Chip
                    icon={<SparklesIcon className="h-4 w-4" />}
                    label="India's #1 Food Delivery App"
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      color: 'white',
                      mb: 3,
                      fontWeight: 500,
                      backdropFilter: 'blur(10px)',
                    }}
                  />
                </motion.div>

                <Typography
                  variant={isMobile ? 'h3' : 'h2'}
                  component="h1"
                  sx={{
                    fontWeight: 800,
                    mb: 3,
                    lineHeight: 1.1,
                    fontSize: { xs: '2.5rem', md: '3.5rem' }
                  }}
                >
                  Craving Something
                  <br />
                  <Box component="span" sx={{ 
                    background: 'linear-gradient(45deg, #fed7aa, #fbbf24)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    Delicious?
                  </Box>
                </Typography>

                <Typography
                  variant="h6"
                  sx={{
                    mb: 4,
                    opacity: 0.95,
                    fontWeight: 400,
                    lineHeight: 1.6,
                    fontSize: { xs: '1.1rem', md: '1.25rem' }
                  }}
                >
                  Get your favorite food delivered in just 28 minutes from 10,000+ restaurants across 50+ cities
                </Typography>

                {/* Stats Row */}
                <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
                  {stats.slice(0, 2).map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    >
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#fed7aa' }}>
                          {stat.number}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          {stat.label}
                        </Typography>
                      </Box>
                    </motion.div>
                  ))}
                </Box>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      component={Link}
                      to="/auth/register/customer"
                      variant="contained"
                      size="large"
                      sx={{
                        backgroundColor: 'white',
                        color: 'primary.main',
                        fontWeight: 600,
                        px: 4,
                        py: 1.8,
                        borderRadius: 2,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                        '&:hover': {
                          backgroundColor: '#f8fafc',
                          boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                        },
                      }}
                      endIcon={<ArrowRightIcon className="h-4 w-4" />}
                    >
                      Order Now - It's Free!
                    </Button>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      component={Link}
                      to="/auth/login"
                      variant="outlined"
                      size="large"
                      sx={{
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                        color: 'white',
                        fontWeight: 600,
                        px: 4,
                        py: 1.8,
                        borderRadius: 2,
                        backdropFilter: 'blur(10px)',
                        '&:hover': {
                          borderColor: 'white',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        },
                      }}
                    >
                      Sign In
                    </Button>
                  </motion.div>
                </Stack>

                {/* Partner CTA */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                  }}>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Restaurant owner?
                    </Typography>
                    <Button
                      component={Link}
                      to="/auth/register/restaurant"
                      size="small"
                      sx={{
                        color: '#fed7aa',
                        fontWeight: 600,
                        textDecoration: 'underline',
                        '&:hover': {
                          backgroundColor: 'rgba(254, 215, 170, 0.1)',
                        },
                      }}
                    >
                      Partner with us →
                    </Button>
                  </Box>
                </motion.div>
              </motion.div>
            </Grid>

            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    height: { xs: 300, md: 450 },
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  {/* Main Hero Image */}
                  <motion.div
                    animate={{
                      y: [0, -10, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    style={{
                      position: 'relative',
                      zIndex: 2,
                    }}
                  >
                    <Box
                      component="img"
                      src="https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                      alt="Delicious food delivery"
                      sx={{
                        width: { xs: 280, md: 350 },
                        height: { xs: 280, md: 350 },
                        objectFit: 'cover',
                        borderRadius: 4,
                        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
                      }}
                    />
                  </motion.div>

                  {/* Floating Elements */}
                  <motion.div
                    animate={{
                      y: [0, -15, 0],
                      rotate: [0, 5, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    style={{
                      position: 'absolute',
                      top: '10%',
                      right: '10%',
                      zIndex: 3,
                    }}
                  >
                    <Box
                      sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: 2,
                        p: 1.5,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        🍕 28min delivery
                      </Typography>
                    </Box>
                  </motion.div>

                  <motion.div
                    animate={{
                      y: [0, 10, 0],
                      rotate: [0, -3, 0],
                    }}
                    transition={{
                      duration: 3.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    style={{
                      position: 'absolute',
                      bottom: '15%',
                      left: '5%',
                      zIndex: 3,
                    }}
                  >
                    <Box
                      sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: 2,
                        p: 1.5,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                        ⭐ 4.8 Rating
                      </Typography>
                    </Box>
                  </motion.div>
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography 
            variant="h3" 
            component="h2" 
            sx={{ 
              fontWeight: 700, 
              mb: 2,
              fontSize: { xs: '2rem', md: '2.5rem' }
            }}
          >
            Why 2M+ customers love us
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Experience the best food delivery service with unmatched quality and speed
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
              >
                <Card
                  sx={{
                    height: '100%',
                    textAlign: 'center',
                    p: 3,
                    border: '1px solid',
                    borderColor: 'grey.100',
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                      borderColor: feature.color,
                    }
                  }}
                >
                  <CardContent sx={{ p: 0 }}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
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
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Stats Section */}
        <Box sx={{ mt: 10, textAlign: 'center' }}>
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={stat.label}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Box>
                    <Typography 
                      variant="h3" 
                      sx={{ 
                        fontWeight: 800, 
                        color: 'primary.main',
                        fontSize: { xs: '1.8rem', md: '2.5rem' }
                      }}
                    >
                      {stat.number}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                      {stat.label}
                    </Typography>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>

      {/* Restaurants Preview Section */}
      <Box sx={{ backgroundColor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" component="h2" sx={{ fontWeight: 600, mb: 2 }}>
              Popular Restaurants
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
              Discover amazing food from top-rated restaurants
            </Typography>

            {/* Cuisine Filter */}
            <CuisineFilter
              selectedCuisine={selectedCuisine}
              onCuisineChange={setSelectedCuisine}
            />
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
            <Grid container spacing={3}>
              {filteredRestaurants?.slice(0, 6).map((restaurant, index) => (
                <Grid item xs={12} sm={6} md={4} key={restaurant._id}>
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

          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              component={Link}
              to="/auth/register/customer"
              variant="contained"
              size="large"
              sx={{ px: 4 }}
            >
              Sign Up to See All Restaurants
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Partner Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Typography variant="h3" component="h2" sx={{ fontWeight: 600, mb: 2 }}>
                Partner with Eatio
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                Grow your restaurant business with our platform. Reach more customers,
                increase sales, and manage orders efficiently.
              </Typography>

              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: 'primary.main',
                    mr: 2
                  }} />
                  <Typography variant="body1">Zero commission for the first month</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: 'primary.main',
                    mr: 2
                  }} />
                  <Typography variant="body1">Easy-to-use restaurant dashboard</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: 'primary.main',
                    mr: 2
                  }} />
                  <Typography variant="body1">Real-time order management</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: 'primary.main',
                    mr: 2
                  }} />
                  <Typography variant="body1">Marketing support and promotions</Typography>
                </Box>
              </Box>

              <Button
                component={Link}
                to="/auth/register/restaurant"
                variant="contained"
                size="large"
                sx={{ px: 4, py: 1.5, fontWeight: 600 }}
              >
                🤝 Partner with Us Today
              </Button>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 400,
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Restaurant partnership"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '16px',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                  }}
                />
              </Box>
            </motion.div>
          </Grid>
        </Grid>
      </Container>

      {/* CTA Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box
          sx={{
            textAlign: 'center',
            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
            color: 'white',
            borderRadius: 4,
            p: 6,
          }}
        >
          <Typography variant="h3" component="h2" sx={{ fontWeight: 600, mb: 2 }}>
            Ready to Order?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Join thousands of happy customers and start ordering today!
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              component={Link}
              to="/auth/register/customer"
              variant="contained"
              size="large"
              sx={{
                backgroundColor: 'white',
                color: 'primary.main',
                fontWeight: 600,
                px: 4,
                '&:hover': {
                  backgroundColor: '#f8fafc',
                },
              }}
            >
              Get Started
            </Button>
            <Button
              component={Link}
              to="/auth/login"
              variant="outlined"
              size="large"
              sx={{
                borderColor: 'white',
                color: 'white',
                fontWeight: 600,
                px: 4,
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Already have an account?
            </Button>
          </Box>
        </Box>
      </Container>
    </div>
  )
}

export default LandingPage