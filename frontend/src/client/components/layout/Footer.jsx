import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Box,
  Container,
  Grid,
  Typography,
  IconButton,
  Divider,
  Button,
  TextField,
  InputAdornment,
} from '@mui/material'
import {
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerSections = [
    {
      title: 'Company',
      links: [
        { label: 'About Us', href: '/about' },
        { label: 'Careers', href: '/careers' },
        { label: 'Contact', href: '/contact' },
        { label: 'Blog', href: '/blog' },
      ],
    },
    {
      title: 'For Restaurants',
      links: [
        { label: 'Partner with us', href: '/auth/register/restaurant' },
        { label: 'Business Solutions', href: '/business' },
        { label: 'Delivery Partners', href: '/delivery' },
        { label: 'Restaurant Support', href: '/restaurant-support' },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'Help Center', href: '/help' },
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Refund Policy', href: '/refund' },
      ],
    },
  ]

  const contactInfo = [
    {
      icon: <MapPinIcon className="h-4 w-4" />,
      text: '123 Food Street, Mumbai, India'
    },
    {
      icon: <PhoneIcon className="h-4 w-4" />,
      text: '+91 98765 43210'
    },
    {
      icon: <EnvelopeIcon className="h-4 w-4" />,
      text: 'support@eatio.com'
    },
    {
      icon: <ClockIcon className="h-4 w-4" />,
      text: '24/7 Customer Support'
    }
  ]

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'grey.900',
        color: 'white',
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4}>
          {/* Brand Section */}
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'linear-gradient(45deg, #f97316, #ea580c)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem'
                  }}
                >
                  🍽️
                </Box>
                <Typography
                  variant="h5"
                  component="div"
                  sx={{
                    fontWeight: 700,
                    background: 'linear-gradient(45deg, #f97316, #ea580c)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Eatio
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ mb: 3, color: 'grey.300' }}>
                Your favorite food delivery app. Order from the best restaurants 
                near you and get it delivered fresh and fast.
              </Typography>
              
              {/* Contact Info */}
              <Box sx={{ mb: 3 }}>
                {contactInfo.map((info, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Box sx={{ color: 'primary.main' }}>{info.icon}</Box>
                    <Typography variant="body2" sx={{ color: 'grey.300' }}>
                      {info.text}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Newsletter Signup */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Stay Updated
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    size="small"
                    placeholder="Enter your email"
                    variant="outlined"
                    sx={{
                      flex: 1,
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        '& fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'primary.main',
                        },
                      },
                      '& .MuiInputBase-input::placeholder': {
                        color: 'rgba(255, 255, 255, 0.7)',
                      }
                    }}
                  />
                  <Button 
                    variant="contained" 
                    size="small"
                    sx={{ minWidth: 'auto', px: 2 }}
                  >
                    Subscribe
                  </Button>
                </Box>
              </Box>
            </motion.div>
          </Grid>

          {/* Links Sections */}
          {footerSections.map((section, index) => (
            <Grid item xs={12} sm={6} md={2.67} key={section.title}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Typography
                  variant="h6"
                  component="h3"
                  sx={{ mb: 2, fontWeight: 600, color: 'white' }}
                >
                  {section.title}
                </Typography>
                <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                  {section.links.map((link) => (
                    <Box component="li" key={link.label} sx={{ mb: 1 }}>
                      <Typography
                        component={Link}
                        to={link.href}
                        variant="body2"
                        sx={{
                          color: 'grey.300',
                          textDecoration: 'none',
                          transition: 'color 0.2s',
                          '&:hover': {
                            color: 'primary.main',
                          },
                        }}
                      >
                        {link.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 4, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

        {/* Bottom Section */}
        <Box
          display="flex"
          flexDirection={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems="center"
          gap={2}
        >
          <Typography variant="body2" sx={{ color: 'grey.400' }}>
            © {currentYear} Eatio. All rights reserved.
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ color: 'grey.400' }}>
              Made with ❤️ for food lovers
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {/* Social Media Icons */}
              <IconButton 
                size="small" 
                sx={{ 
                  color: 'grey.400',
                  '&:hover': { color: 'primary.main' }
                }}
              >
                📱
              </IconButton>
              <IconButton 
                size="small" 
                sx={{ 
                  color: 'grey.400',
                  '&:hover': { color: 'primary.main' }
                }}
              >
                📧
              </IconButton>
              <IconButton 
                size="small" 
                sx={{ 
                  color: 'grey.400',
                  '&:hover': { color: 'primary.main' }
                }}
              >
                🐦
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

export default Footer