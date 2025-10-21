import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Rating,
  Divider,
  IconButton,
  Skeleton,
  Alert,
  Tabs,
  Tab,
  Badge,
} from '@mui/material'
import {
  MapPinIcon,
  ClockIcon,
  StarIcon,
  PlusIcon,
  MinusIcon,
  ShoppingCartIcon,
  HeartIcon,
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

import { useRestaurant } from '../api/queries'
import { addToCart } from '../store/slices/cartSlice'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { getMenuItemImageUrl } from '../../common/utils/imageUtils'

const RestaurantDetailPage = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const [selectedTab, setSelectedTab] = useState(0)
  const [quantities, setQuantities] = useState({})

  const { data: restaurant, isLoading, error } = useRestaurant(id)

  // Get high-quality hero image for restaurant detail page
  const getRestaurantHeroImage = (cuisine) => {
    const heroImageMap = {
      'Indian': 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', // Indian restaurant interior
      'Chinese': 'https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', // Chinese restaurant ambiance
      'Italian': 'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', // Italian restaurant with pizza oven
      'Mexican': 'https://images.unsplash.com/photo-1613514785940-daed07799d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', // Colorful Mexican restaurant
      'American': 'https://images.unsplash.com/photo-1551218808-94e220e084d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', // American diner style
      'Thai': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', // Thai restaurant with traditional decor
      'Japanese': 'https://images.unsplash.com/photo-1579027989054-b11c9b8c2e3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', // Japanese sushi bar
      'Mediterranean': 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', // Mediterranean restaurant terrace
    }

    const primaryCuisine = cuisine?.[0] || 'Indian'
    return heroImageMap[primaryCuisine] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
  }

  const handleQuantityChange = (itemId, change) => {
    setQuantities(prev => ({
      ...prev,
      [itemId]: Math.max(0, (prev[itemId] || 0) + change)
    }))
  }

  const handleAddToCart = (item) => {
    const quantity = quantities[item._id] || 1
    dispatch(addToCart({
      item: { ...item, quantity },
      restaurantId: restaurant._id
    }))
    toast.success(`${item.name} added to cart!`)
    // Reset quantity after adding to cart
    setQuantities(prev => ({
      ...prev,
      [item._id]: 0
    }))
  }

  const getMenuCategories = () => {
    if (!restaurant?.menuItems) return []
    const categories = [...new Set(restaurant.menuItems.map(item => item.category))]
    return categories
  }

  const getItemsByCategory = (category) => {
    return restaurant?.menuItems?.filter(item => item.category === category) || []
  }

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Skeleton variant="rectangular" height={300} />
          </Grid>
          <Grid item xs={12} md={8}>
            <Skeleton variant="text" height={60} />
            <Skeleton variant="text" height={40} />
            <Skeleton variant="text" height={40} />
          </Grid>
        </Grid>
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Failed to load restaurant details. Please try again later.
        </Alert>
      </Container>
    )
  }

  if (!restaurant) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">
          Restaurant not found.
        </Alert>
      </Container>
    )
  }

  const categories = getMenuCategories()

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Restaurant Header */}
        <Box sx={{ mb: 4 }}>
          {/* Hero Image */}
          <Box sx={{ position: 'relative', height: { xs: 200, md: 300 }, overflow: 'hidden', borderRadius: 3 }}>
            <CardMedia
              component="img"
              height="100%"
              image={getRestaurantHeroImage(restaurant.cuisine)}
              alt={restaurant.name}
              sx={{ 
                objectFit: 'cover',
                width: '100%',
                height: '100%',
              }}
            />
            
            {/* Overlay Gradient */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '50%',
                background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
              }}
            />

            {/* Restaurant Status Badge */}
            <Box
              sx={{
                position: 'absolute',
                top: 16,
                left: 16,
                backgroundColor: restaurant.isOpen ? 'success.main' : 'error.main',
                color: 'white',
                px: 2,
                py: 1,
                borderRadius: 2,
                fontWeight: 600,
                fontSize: '0.9rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            >
              {restaurant.isOpen !== false ? '🟢 Open Now' : '🔴 Closed'}
            </Box>

            {/* Favorite Button */}
            <IconButton
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                '&:hover': {
                  backgroundColor: 'white',
                },
              }}
            >
              <HeartIcon className="h-5 w-5" />
            </IconButton>
          </Box>

          {/* Restaurant Info Card */}
          <Card sx={{ mt: -6, mx: 2, position: 'relative', zIndex: 1, borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={8}>
                  <Typography 
                    variant="h3" 
                    component="h1" 
                    sx={{ 
                      fontWeight: 800, 
                      mb: 2,
                      fontSize: { xs: '1.8rem', md: '2.5rem' }
                    }}
                  >
                    {restaurant.name}
                  </Typography>

                  {/* Cuisine Tags */}
                  <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                    {restaurant.cuisine?.map((cuisine) => (
                      <Chip 
                        key={cuisine} 
                        label={cuisine} 
                        sx={{
                          backgroundColor: 'primary.light',
                          color: 'primary.main',
                          fontWeight: 600,
                          '&:hover': {
                            backgroundColor: 'primary.main',
                            color: 'white',
                          }
                        }}
                      />
                    ))}
                  </Box>

                  {/* Rating and Stats */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2, flexWrap: 'wrap' }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      backgroundColor: 'success.main',
                      color: 'white',
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      fontWeight: 600,
                    }}>
                      <StarIcon className="h-4 w-4" />
                      {restaurant.averageRating?.toFixed(1) || '4.2'}
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        ({Math.floor(Math.random() * 1000) + 500}+ reviews)
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ClockIcon className="h-4 w-4 text-gray-500" />
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        28-35 mins
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: 'success.main' }}>
                        ₹{Math.floor(Math.random() * 200) + 200} for two
                      </Typography>
                    </Box>
                  </Box>

                  {/* Address */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MapPinIcon className="h-4 w-4 text-gray-500" />
                    <Typography variant="body2" color="text.secondary">
                      {restaurant.address?.street}, {restaurant.address?.city} - {restaurant.address?.pincode}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Box sx={{ 
                    textAlign: { xs: 'left', md: 'right' },
                    backgroundColor: 'success.light',
                    p: 2,
                    borderRadius: 2,
                    border: '2px dashed',
                    borderColor: 'success.main',
                  }}>
                    <Typography variant="h6" color="success.main" sx={{ fontWeight: 700, mb: 1 }}>
                      🚚 FREE DELIVERY
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      On orders above ₹199
                    </Typography>
                    <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
                      You'll save ₹49 on delivery!
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>

        {/* Menu Section */}
        {restaurant.menuItems && restaurant.menuItems.length > 0 ? (
          <Card>
            <CardContent sx={{ p: 0 }}>
              {/* Category Tabs */}
              {categories.length > 1 && (
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs
                    value={selectedTab}
                    onChange={(e, newValue) => setSelectedTab(newValue)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{ px: 3 }}
                  >
                    {categories.map((category, index) => (
                      <Tab
                        key={category}
                        label={category}
                        sx={{ textTransform: 'capitalize' }}
                      />
                    ))}
                  </Tabs>
                </Box>
              )}

              {/* Menu Items */}
              <Box sx={{ p: 3 }}>
                {categories.map((category, categoryIndex) => (
                  <Box
                    key={category}
                    sx={{
                      display: selectedTab === categoryIndex || categories.length === 1 ? 'block' : 'none'
                    }}
                  >
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, textTransform: 'capitalize' }}>
                      {category}
                    </Typography>

                    <Grid container spacing={3}>
                      {getItemsByCategory(category).map((item, index) => (
                        <Grid item xs={12} key={item._id}>
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            whileHover={{ y: -2 }}
                          >
                            <Card 
                              sx={{ 
                                p: 0,
                                borderRadius: 3,
                                border: '1px solid',
                                borderColor: 'grey.100',
                                overflow: 'hidden',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                                  borderColor: 'primary.light',
                                }
                              }}
                            >
                              <Grid container>
                                {/* Item Image */}
                                <Grid item xs={4} sm={3} md={2}>
                                  <Box sx={{ position: 'relative', height: { xs: 120, sm: 140 } }}>
                                    <CardMedia
                                      component="img"
                                      height="100%"
                                      image={(() => {
                                        const imageUrl = getMenuItemImageUrl(item.image, item.name, item.category, restaurant.cuisine)
                                        return imageUrl
                                      })()}
                                      alt={item.name}
                                      sx={{
                                        objectFit: 'cover',
                                        width: '100%',
                                        height: '100%',
                                      }}
                                      onError={(e) => {
                                        const fallbackUrl = getMenuItemImageUrl(null, item.name, item.category, restaurant.cuisine)
                                        e.target.src = fallbackUrl
                                      }}
                                    />
                                    
                                    {/* Bestseller Badge */}
                                    {Math.random() > 0.7 && (
                                      <Box
                                        sx={{
                                          position: 'absolute',
                                          top: 8,
                                          left: 8,
                                          backgroundColor: 'error.main',
                                          color: 'white',
                                          px: 1,
                                          py: 0.3,
                                          borderRadius: 1,
                                          fontSize: '0.7rem',
                                          fontWeight: 600,
                                        }}
                                      >
                                        BESTSELLER
                                      </Box>
                                    )}

                                    {/* Veg/Non-veg Indicator */}
                                    <Box
                                      sx={{
                                        position: 'absolute',
                                        bottom: 8,
                                        left: 8,
                                        width: 16,
                                        height: 16,
                                        border: '2px solid',
                                        borderColor: Math.random() > 0.5 ? 'success.main' : 'error.main',
                                        backgroundColor: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                      }}
                                    >
                                      <Box
                                        sx={{
                                          width: 6,
                                          height: 6,
                                          borderRadius: '50%',
                                          backgroundColor: Math.random() > 0.5 ? 'success.main' : 'error.main',
                                        }}
                                      />
                                    </Box>
                                  </Box>
                                </Grid>

                                {/* Item Details */}
                                <Grid item xs={8} sm={9} md={10}>
                                  <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <Box sx={{ flex: 1 }}>
                                      <Typography 
                                        variant="h6" 
                                        sx={{ 
                                          fontWeight: 700, 
                                          mb: 1,
                                          fontSize: { xs: '1rem', sm: '1.1rem' }
                                        }}
                                      >
                                        {item.name}
                                      </Typography>

                                      {/* Rating */}
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <Box sx={{ 
                                          display: 'flex', 
                                          alignItems: 'center', 
                                          gap: 0.5,
                                          backgroundColor: 'success.main',
                                          color: 'white',
                                          px: 1,
                                          py: 0.2,
                                          borderRadius: 1,
                                          fontSize: '0.75rem',
                                          fontWeight: 600,
                                        }}>
                                          <StarIcon className="h-3 w-3" />
                                          {(Math.random() * 1.5 + 3.5).toFixed(1)}
                                        </Box>
                                        <Typography variant="caption" color="text.secondary">
                                          ({Math.floor(Math.random() * 200) + 50} reviews)
                                        </Typography>
                                      </Box>

                                      <Typography 
                                        variant="body2" 
                                        color="text.secondary" 
                                        sx={{ 
                                          mb: 2,
                                          lineHeight: 1.5,
                                          display: '-webkit-box',
                                          WebkitLineClamp: 2,
                                          WebkitBoxOrient: 'vertical',
                                          overflow: 'hidden',
                                        }}
                                      >
                                        {item.description || 'Delicious and freshly prepared with the finest ingredients'}
                                      </Typography>
                                    </Box>

                                    {/* Price and Add Button */}
                                    <Box sx={{ 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      justifyContent: 'space-between',
                                      mt: 'auto'
                                    }}>
                                      <Box>
                                        <Typography 
                                          variant="h6" 
                                          sx={{ 
                                            fontWeight: 700,
                                            color: 'text.primary',
                                            fontSize: { xs: '1rem', sm: '1.1rem' }
                                          }}
                                        >
                                          ₹{item.price}
                                        </Typography>
                                        {Math.random() > 0.6 && (
                                          <Typography 
                                            variant="caption" 
                                            sx={{ 
                                              textDecoration: 'line-through',
                                              color: 'text.secondary',
                                              mr: 1
                                            }}
                                          >
                                            ₹{item.price + Math.floor(Math.random() * 50) + 20}
                                          </Typography>
                                        )}
                                      </Box>

                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {quantities[item._id] > 0 ? (
                                          <>
                                            <Box sx={{ 
                                              display: 'flex', 
                                              alignItems: 'center', 
                                              backgroundColor: 'primary.light',
                                              borderRadius: 2,
                                              p: 0.5,
                                            }}>
                                              <IconButton
                                                size="small"
                                                onClick={() => handleQuantityChange(item._id, -1)}
                                                sx={{ 
                                                  color: 'primary.main',
                                                  '&:hover': { backgroundColor: 'primary.main', color: 'white' }
                                                }}
                                              >
                                                <MinusIcon className="h-4 w-4" />
                                              </IconButton>
                                              <Typography 
                                                sx={{ 
                                                  minWidth: 24, 
                                                  textAlign: 'center',
                                                  fontWeight: 600,
                                                  color: 'primary.main'
                                                }}
                                              >
                                                {quantities[item._id]}
                                              </Typography>
                                              <IconButton
                                                size="small"
                                                onClick={() => handleQuantityChange(item._id, 1)}
                                                sx={{ 
                                                  color: 'primary.main',
                                                  '&:hover': { backgroundColor: 'primary.main', color: 'white' }
                                                }}
                                              >
                                                <PlusIcon className="h-4 w-4" />
                                              </IconButton>
                                            </Box>
                                            <Button
                                              variant="contained"
                                              size="small"
                                              onClick={() => handleAddToCart(item)}
                                              sx={{ 
                                                borderRadius: 2,
                                                fontWeight: 600,
                                                px: 2,
                                              }}
                                            >
                                              ADD TO CART
                                            </Button>
                                          </>
                                        ) : (
                                          <Button
                                            variant="outlined"
                                            size="medium"
                                            onClick={() => handleQuantityChange(item._id, 1)}
                                            sx={{ 
                                              borderRadius: 2,
                                              fontWeight: 600,
                                              px: 3,
                                              borderWidth: 2,
                                              '&:hover': {
                                                borderWidth: 2,
                                              }
                                            }}
                                          >
                                            ADD
                                          </Button>
                                        )}
                                      </Box>
                                    </Box>
                                  </Box>
                                </Grid>
                              </Grid>
                            </Card>
                          </motion.div>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        ) : (
          <Alert severity="info">
            This restaurant hasn't added their menu yet. Please check back later!
          </Alert>
        )}
      </motion.div>
    </Container>
  )
}

export default RestaurantDetailPage