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
      {/* Enhanced Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
          color: 'white',
          py: { xs: 6, md: 8 },
          position: 'relative',
          overflow: 'hidden',
          minHeight: { xs: '70vh', md: '80vh' },
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* Enhanced Background Pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.08'%3E%3Cpath d='M30 30c0-8.3-6.7-15-15-15s-15 6.7-15 15 6.7 15 15 15 15-6.7 15-15zm15 0c0-8.3-6.7-15-15-15s-15 6.7-15 15 6.7 15 15 15 15-6.7 15-15z'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Floating Food Icons */}
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            right: '10%',
            fontSize: '3rem',
            opacity: 0.1,
            animation: 'float 6s ease-in-out infinite',
            '@keyframes float': {
              '0%, 100%': { transform: 'translateY(0px)' },
              '50%': { transform: 'translateY(-20px)' },
            },
          }}
        >
          🍕
        </Box>
        <Box
          sx={{
            position: 'absolute',
            bottom: '15%',
            left: '5%',
            fontSize: '2.5rem',
            opacity: 0.1,
            animation: 'float 8s ease-in-out infinite',
            animationDelay: '2s',
          }}
        >
          🍔
        </Box>
        <Box
          sx={{
            position: 'absolute',
            top: '20%',
            left: '15%',
            fontSize: '2rem',
            opacity: 0.1,
            animation: 'float 7s ease-in-out infinite',
            animationDelay: '4s',
          }}
        >
          🍜
        </Box>

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
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
                  <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' }, mb: 4 }}>
                    <Chip
                      icon={<SparklesIcon className="h-4 w-4" />}
                      label="India's #1 Food Delivery App"
                      sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        fontWeight: 600,
                        backdropFilter: 'blur(10px)',
                        fontSize: { xs: '0.8rem', sm: '0.9rem' },
                        height: { xs: 36, sm: 40 },
                        px: { xs: 2, sm: 3 },
                        minWidth: 'fit-content',
                        maxWidth: 'none',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        '& .MuiChip-label': {
                          overflow: 'visible',
                          textOverflow: 'unset',
                          whiteSpace: 'nowrap',
                        }
                      }}
                    />
                  </Box>
                </motion.div>

                <Typography
                  variant="h2"
                  component="h1"
                  sx={{
                    fontWeight: 800,
                    mb: 3,
                    lineHeight: 1.1,
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    textAlign: { xs: 'center', md: 'left' },
                  }}
                >
                  Delicious food,{' '}
                  <Box component="span" sx={{ color: '#fbbf24' }}>
                    delivered fast
                  </Box>
                </Typography>

                <Typography
                  variant="h6"
                  sx={{
                    mb: 4,
                    opacity: 0.9,
                    fontSize: { xs: '1.1rem', md: '1.3rem' },
                    textAlign: { xs: 'center', md: 'left' },
                    lineHeight: 1.6,
                  }}
                >
                  Order from 10,000+ restaurants • Lightning fast delivery • Available in 50+ cities
                </Typography>

                {/* Enhanced CTA Buttons */}
                <Box sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 3,
                  justifyContent: { xs: 'center', md: 'flex-start' },
                  alignItems: 'center',
                  mb: 4
                }}>
                  <Button
                    component={Link}
                    to="/auth/register/customer"
                    variant="contained"
                    size="large"
                    sx={{
                      background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
                      color: 'primary.main',
                      fontWeight: 700,
                      px: 6,
                      py: 2,
                      borderRadius: 4,
                      fontSize: '1.2rem',
                      textTransform: 'none',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                      border: '2px solid rgba(255,255,255,0.9)',
                      minWidth: { xs: '250px', sm: 'auto' },
                      '&:hover': {
                        background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                        boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
                        transform: 'translateY(-3px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    🍽️ Start Ordering Now
                  </Button>

                  <Button
                    component={Link}
                    to="/auth/login"
                    variant="outlined"
                    size="large"
                    sx={{
                      color: 'white',
                      borderColor: 'rgba(255,255,255,0.7)',
                      fontWeight: 600,
                      px: 5,
                      py: 2,
                      borderRadius: 4,
                      fontSize: '1.1rem',
                      textTransform: 'none',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(10px)',
                      minWidth: { xs: '250px', sm: 'auto' },
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        borderColor: 'rgba(255,255,255,0.9)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Already a member? Log In
                  </Button>
                </Box>

                {/* Trust Indicators */}
                <Box sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: { xs: 2, sm: 4 },
                  alignItems: 'center',
                  justifyContent: { xs: 'center', md: 'flex-start' },
                  opacity: 0.9,
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h6" sx={{ color: '#fbbf24' }}>⭐</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      4.8/5 rating
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h6" sx={{ color: '#10b981' }}>🚀</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      2M+ orders delivered
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h6" sx={{ color: '#3b82f6' }}>🔒</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      100% secure
                    </Typography>
                  </Box>
                </Box>
              </motion.div>
            </Grid>

            {/* Hero Image/Illustration */}
            <Grid item xs={12} md={5}>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: { xs: '300px', md: '400px' },
                    position: 'relative',
                  }}
                >
                  {/* Food Delivery Illustration */}
                  <Box
                    sx={{
                      width: { xs: '250px', md: '350px' },
                      height: { xs: '250px', md: '350px' },
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(20px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: { xs: '8rem', md: '12rem' },
                      boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                      animation: 'pulse 4s ease-in-out infinite',
                      '@keyframes pulse': {
                        '0%, 100%': { transform: 'scale(1)' },
                        '50%': { transform: 'scale(1.05)' },
                      },
                    }}
                  >
                    🛵
                  </Box>
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Enhanced Features Section */}
      <Box sx={{ backgroundColor: '#fafafa', py: { xs: 4, md: 6 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Typography
              variant="h3"
              component="h2"
              sx={{
                fontWeight: 700,
                mb: 2,
                fontSize: { xs: '2rem', md: '2.5rem' },
                color: 'text.primary'
              }}
            >
              Why choose Eatio?
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{
                fontSize: { xs: '1rem', md: '1.2rem' },
                maxWidth: '600px',
                mx: 'auto'
              }}
            >
              Experience the best food delivery service with unmatched quality and speed
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card
                    sx={{
                      textAlign: 'center',
                      p: 3,
                      height: '100%',
                      borderRadius: 4,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      border: '1px solid',
                      borderColor: 'grey.100',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                        borderColor: feature.color,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${feature.color}20, ${feature.color}10)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 3,
                        color: feature.color,
                        fontSize: '2rem',
                        boxShadow: `0 8px 24px ${feature.color}20`,
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {feature.description}
                    </Typography>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Enhanced Restaurants Preview Section */}
      <Box sx={{ py: { xs: 5, md: 7 } }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
          {/* Cuisine Filter Section */}
          <Box sx={{ mb: 5 }}>
            <CuisineFilter
              selectedCuisine={selectedCuisine}
              onCuisineChange={setSelectedCuisine}
            />
          </Box>

          {/* Restaurant Grid */}
          {isLoading ? (
            <Grid container spacing={{ xs: 2, sm: 3 }}>
              {[...Array(8)].map((_, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                  <Card sx={{ borderRadius: 3 }}>
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
            <Grid container spacing={{ xs: 2, sm: 3 }}>
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


        </Container>
      </Box>




    </div>
  )
}

export default LandingPage