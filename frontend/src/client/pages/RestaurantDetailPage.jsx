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

  // Generate consistent review count based on restaurant ID to prevent changes on re-render
  const getConsistentReviewCount = (restaurantId) => {
    if (!restaurantId) return 500
    // Use restaurant ID to generate a consistent "random" number
    const hash = restaurantId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
    return Math.abs(hash % 1000) + 500
  }

  // Generate consistent original price (10-15% higher) for discounted price display
  const getOriginalPrice = (currentPrice, itemId) => {
    if (!itemId) return currentPrice
    // Use item ID to generate consistent discount percentage between 10-15%
    const hash = itemId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
    const discountPercent = (Math.abs(hash % 6) + 10) / 100 // 10-15%
    return Math.round(currentPrice / (1 - discountPercent))
  }

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
    return ['All Items', ...categories] // Add "All Items" as first category
  }

  const getItemsByCategory = (category) => {
    if (category === 'All Items') {
      return restaurant?.menuItems || [] // Return all items for "All Items" tab
    }
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
        {/* Compact Restaurant Header */}
        <Box sx={{ 
          backgroundColor: 'white',
          borderBottom: '1px solid',
          borderColor: 'grey.200',
          p: 3,
          mb: 3
        }}>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 700, 
              mb: 1,
              fontSize: { xs: '1.5rem', md: '1.8rem' }
            }}
          >
            {restaurant.name}
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {restaurant.cuisine?.join(', ')}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <span>📍</span>
              <Typography variant="body2" color="text.secondary">
                {restaurant.address?.street}, {restaurant.address?.city}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 0.5,
                backgroundColor: 'success.main',
                color: 'white',
                px: 1,
                py: 0.3,
                borderRadius: 1,
                fontSize: '0.85rem',
                fontWeight: 600,
              }}>
                <StarIcon className="h-3 w-3" />
                {restaurant.averageRating?.toFixed(1) || '4.2'}
              </Box>
              <Typography variant="body2" color="text.secondary">
                ({getConsistentReviewCount(restaurant._id)}+ reviews)
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <span>🕒</span>
              <Typography variant="body2">28-35 mins</Typography>
            </Box>


          </Box>

          <Box sx={{ 
            backgroundColor: 'success.light',
            color: 'success.main',
            p: 1.5,
            borderRadius: 1,
            display: 'inline-block'
          }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              ✅ FREE DELIVERY on orders above ₹199
            </Typography>
          </Box>
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
                        sx={{ 
                          textTransform: category === 'All Items' ? 'none' : 'capitalize',
                          fontWeight: category === 'All Items' ? 600 : 400
                        }}
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
                    <Typography variant="h5" sx={{ 
                      fontWeight: 600, 
                      mb: 3, 
                      textTransform: category === 'All Items' ? 'none' : 'capitalize' 
                    }}>
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
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                                          <Typography 
                                            variant="body2" 
                                            sx={{ 
                                              textDecoration: 'line-through',
                                              color: 'text.secondary',
                                              fontSize: { xs: '0.8rem', sm: '0.9rem' }
                                            }}
                                          >
                                            ₹{getOriginalPrice(item.price, item._id)}
                                          </Typography>
                                        </Box>
                                      </Box>

                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {(quantities[item._id] || 0) > 0 ? (
                                          <>
                                            {/* Quantity Selector */}
                                            <Box sx={{ 
                                              display: 'flex', 
                                              alignItems: 'center', 
                                              backgroundColor: 'white',
                                              border: '2px solid',
                                              borderColor: 'primary.main',
                                              borderRadius: 2,
                                              overflow: 'hidden',
                                            }}>
                                              <IconButton
                                                size="small"
                                                onClick={() => handleQuantityChange(item._id, -1)}
                                                sx={{ 
                                                  color: 'primary.main',
                                                  borderRadius: 0,
                                                  width: 36,
                                                  height: 36,
                                                  '&:hover': { 
                                                    backgroundColor: 'primary.main', 
                                                    color: 'white' 
                                                  }
                                                }}
                                              >
                                                <MinusIcon className="h-4 w-4" />
                                              </IconButton>
                                              
                                              <Typography 
                                                sx={{ 
                                                  minWidth: 40, 
                                                  textAlign: 'center',
                                                  fontWeight: 700,
                                                  color: 'primary.main',
                                                  py: 1,
                                                  backgroundColor: 'primary.light',
                                                  fontSize: '1rem',
                                                }}
                                              >
                                                {quantities[item._id]}
                                              </Typography>
                                              
                                              <IconButton
                                                size="small"
                                                onClick={() => handleQuantityChange(item._id, 1)}
                                                sx={{ 
                                                  color: 'primary.main',
                                                  borderRadius: 0,
                                                  width: 36,
                                                  height: 36,
                                                  '&:hover': { 
                                                    backgroundColor: 'primary.main', 
                                                    color: 'white' 
                                                  }
                                                }}
                                              >
                                                <PlusIcon className="h-4 w-4" />
                                              </IconButton>
                                            </Box>
                                            
                                            {/* Add to Cart Button */}
                                            <Button
                                              variant="contained"
                                              size="small"
                                              onClick={() => handleAddToCart(item)}
                                              sx={{ 
                                                borderRadius: 2,
                                                fontWeight: 600,
                                                px: 2,
                                                py: 1,
                                                fontSize: '0.85rem',
                                              }}
                                            >
                                              ADD TO CART
                                            </Button>
                                          </>
                                        ) : (
                                          /* Initial Add Button */
                                          <Button
                                            variant="outlined"
                                            size="medium"
                                            onClick={() => handleQuantityChange(item._id, 1)}
                                            sx={{ 
                                              borderRadius: 2,
                                              fontWeight: 600,
                                              px: 3,
                                              py: 1,
                                              borderWidth: 2,
                                              '&:hover': {
                                                borderWidth: 2,
                                                backgroundColor: 'primary.main',
                                                color: 'white',
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