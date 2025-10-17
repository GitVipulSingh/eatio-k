import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Grid,
  Paper,
} from '@mui/material'
import {
  UserIcon,
  BuildingStorefrontIcon,
} from '@heroicons/react/24/outline'

const RoleSelectionPage = () => {
  const roles = [
    {
      type: 'customer',
      title: 'Join as Customer',
      description: 'Order delicious food from your favorite restaurants',
      icon: UserIcon,
      color: '#10b981',
      features: [
        'Browse restaurants',
        'Order food online',
        'Track your orders',
        'Save favorite restaurants',
        'Multiple delivery addresses'
      ],
      path: '/register/customer'
    },
    {
      type: 'restaurant',
      title: 'Join as Restaurant',
      description: 'Grow your business by reaching more customers',
      icon: BuildingStorefrontIcon,
      color: '#f97316',
      features: [
        'Manage your restaurant',
        'Add menu items',
        'Track orders',
        'Business analytics',
        'Customer reviews'
      ],
      path: '/register/admin'
    }
  ]

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box textAlign="center" sx={{ mb: 6 }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
            Join Eatio Today! 🍕
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            Choose how you'd like to be part of our food community
          </Typography>
        </Box>

        <Grid container spacing={4} justifyContent="center">
          {roles.map((role, index) => (
            <Grid item xs={12} md={5} key={role.type}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                whileHover={{ y: -8 }}
              >
                <Card
                  sx={{
                    height: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      boxShadow: (theme) => theme.shadows[12],
                    },
                  }}
                >
                  {/* Background Pattern */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: 100,
                      height: 100,
                      background: `linear-gradient(135deg, ${role.color}20, ${role.color}10)`,
                      borderRadius: '0 0 0 100px',
                    }}
                  />

                  <CardContent sx={{ p: 4, position: 'relative' }}>
                    {/* Icon */}
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        backgroundColor: `${role.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 3,
                        mx: 'auto',
                      }}
                    >
                      <role.icon 
                        style={{ 
                          width: 40, 
                          height: 40, 
                          color: role.color 
                        }} 
                      />
                    </Box>

                    {/* Title */}
                    <Typography
                      variant="h4"
                      component="h2"
                      sx={{
                        fontWeight: 600,
                        mb: 2,
                        textAlign: 'center',
                        color: role.color,
                      }}
                    >
                      {role.title}
                    </Typography>

                    {/* Description */}
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ mb: 3, textAlign: 'center' }}
                    >
                      {role.description}
                    </Typography>

                    {/* Features */}
                    <Box sx={{ mb: 4 }}>
                      {role.features.map((feature, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mb: 1,
                          }}
                        >
                          <Box
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              backgroundColor: role.color,
                              mr: 2,
                            }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {feature}
                          </Typography>
                        </Box>
                      ))}
                    </Box>

                    {/* CTA Button */}
                    <Button
                      component={Link}
                      to={role.path}
                      variant="contained"
                      fullWidth
                      size="large"
                      sx={{
                        backgroundColor: role.color,
                        '&:hover': {
                          backgroundColor: role.color,
                          filter: 'brightness(0.9)',
                        },
                        py: 1.5,
                        fontWeight: 600,
                      }}
                    >
                      Get Started
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Already have account */}
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Typography variant="body1" color="text.secondary">
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#f97316', textDecoration: 'none', fontWeight: 500 }}>
              Sign in here
            </Link>
          </Typography>
        </Box>
      </motion.div>
    </Container>
  )
}

export default RoleSelectionPage