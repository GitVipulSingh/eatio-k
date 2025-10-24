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
} from '@mui/material'
import {
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  // Column 1: Eatio (Logo, Description, Contact Info, Social Media, Newsletter)
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
    }
  ]

  const socialMediaLinks = [
    { icon: '📘', label: 'Facebook', href: 'https://facebook.com/eatio' },
    { icon: '📷', label: 'Instagram', href: 'https://instagram.com/eatio' },
    { icon: '🐦', label: 'Twitter', href: 'https://twitter.com/eatio' }
  ]

  // Column 2: Company
  const companyLinks = [
    { label: 'About Us', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Contact', href: '/contact' },
    { label: 'Blog', href: '/blog' },
  ]

  // Column 3: For Restaurants
  const restaurantLinks = [
    { label: 'Partner with us', href: '/auth/register/restaurant' },
    { label: 'Business Solutions', href: '/business' },
    { label: 'Delivery Partners', href: '/delivery' },
    { label: 'Restaurant Support', href: '/restaurant-support' },
  ]

  // Column 4: Help & Legal
  const helpLegalLinks = [
    { label: 'Help Center', href: '/help' },
    { label: '24/7 Customer Support', href: '/support' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Refund Policy', href: '/refund' },
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
        {/* Single Unified 4-Column Grid */}
        <Grid container spacing={4}>
          {/* Column 1: Eatio (Logo, Description, Contact Info, Social Media, Newsletter) */}
          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Logo and Brand */}
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

              {/* Description */}
              <Typography variant="body2" sx={{ mb: 3, color: 'grey.300', lineHeight: 1.6 }}>
                Your favorite food delivery app. Order from the best restaurants 
                near you and get it delivered fresh and fast.
              </Typography>
              
              {/* Contact Information */}
              <Box sx={{ mb: 3 }}>
                {contactInfo.map((info, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <Box sx={{ color: 'primary.main', flexShrink: 0 }}>{info.icon}</Box>
                    <Typography variant="body2" sx={{ color: 'grey.300' }}>
                      {info.text}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Social Media Icons */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: 'white' }}>
                  Follow Us
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {socialMediaLinks.map((social, index) => (
                    <IconButton
                      key={index}
                      component="a"
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      size="small"
                      sx={{
                        color: 'grey.400',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        width: 36,
                        height: 36,
                        '&:hover': {
                          color: 'primary.main',
                          backgroundColor: 'rgba(249, 115, 22, 0.1)',
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.2s ease'
                      }}
                      aria-label={social.label}
                    >
                      {social.icon}
                    </IconButton>
                  ))}
                </Box>
              </Box>

              {/* Newsletter Signup */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: 'white' }}>
                  Stay Updated
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, color: 'grey.400', fontSize: '0.875rem' }}>
                  Get the latest updates on new restaurants and offers.
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
                        fontSize: '0.875rem',
                        '& fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'primary.main',
                        },
                        '&.Mui-focused fieldset': {
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
                    sx={{ 
                      minWidth: 'auto', 
                      px: 2,
                      fontWeight: 600,
                      textTransform: 'none'
                    }}
                  >
                    Subscribe
                  </Button>
                </Box>
              </Box>
            </motion.div>
          </Grid>

          {/* Column 2: Company */}
          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Typography
                variant="h6"
                component="h3"
                sx={{ mb: 3, fontWeight: 600, color: 'white' }}
              >
                Company
              </Typography>
              <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                {companyLinks.map((link) => (
                  <Box component="li" key={link.label} sx={{ mb: 1.5 }}>
                    <Typography
                      component={Link}
                      to={link.href}
                      variant="body2"
                      sx={{
                        color: 'grey.300',
                        textDecoration: 'none',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          color: 'primary.main',
                          paddingLeft: '4px',
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

          {/* Column 3: For Restaurants */}
          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Typography
                variant="h6"
                component="h3"
                sx={{ mb: 3, fontWeight: 600, color: 'white' }}
              >
                For Restaurants
              </Typography>
              <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                {restaurantLinks.map((link) => (
                  <Box component="li" key={link.label} sx={{ mb: 1.5 }}>
                    <Typography
                      component={Link}
                      to={link.href}
                      variant="body2"
                      sx={{
                        color: 'grey.300',
                        textDecoration: 'none',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          color: 'primary.main',
                          paddingLeft: '4px',
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

          {/* Column 4: Help & Legal */}
          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Typography
                variant="h6"
                component="h3"
                sx={{ mb: 3, fontWeight: 600, color: 'white' }}
              >
                Help & Legal
              </Typography>
              <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                {helpLegalLinks.map((link) => (
                  <Box component="li" key={link.label} sx={{ mb: 1.5 }}>
                    <Typography
                      component={Link}
                      to={link.href}
                      variant="body2"
                      sx={{
                        color: 'grey.300',
                        textDecoration: 'none',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          color: 'primary.main',
                          paddingLeft: '4px',
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
        </Grid>

        {/* Footer Bottom Bar */}
        <Divider sx={{ my: 4, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
        
        <Box
          sx={{
            textAlign: 'center',
            py: 2,
          }}
        >
          <Typography variant="body2" sx={{ color: 'grey.400' }}>
            © {currentYear} Eatio. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}

export default Footer