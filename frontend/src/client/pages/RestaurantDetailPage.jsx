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
        <Card sx={{ mb: 4 }}>
          <CardMedia
            component="img"
            height="300"
            image={getRestaurantHeroImage(restaurant.cuisine)}
            alt={restaurant.name}
            sx={{ objectFit: 'cover' }}
          />
          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
                  {restaurant.name}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  {restaurant.cuisine?.map((cuisine) => (
                    <Chip key={cuisine} label={cuisine} variant="outlined" />
                  ))}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Rating value={restaurant.averageRating || 4.2} precision={0.1} size="small" readOnly />
                    <Typography variant="body2" color="text.secondary">
                      ({restaurant.averageRating?.toFixed(1) || '4.2'})
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ClockIcon className="h-4 w-4 text-gray-500" />
                    <Typography variant="body2" color="text.secondary">
                      30-45 min
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <MapPinIcon className="h-4 w-4 text-gray-500" />
                  <Typography variant="body2" color="text.secondary">
                    {restaurant.address?.street}, {restaurant.address?.city} - {restaurant.address?.pincode}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                  <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600 }}>
                    Free Delivery
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Minimum order ₹199
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

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

                    <Grid container spacing={2}>
                      {getItemsByCategory(category).map((item, index) => (
                        <Grid item xs={12} key={item._id}>
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                          >
                            <Card variant="outlined" sx={{ p: 2 }}>
                              <Grid container spacing={2} alignItems="center">
                                <Grid item xs={3} sm={2}>
                                  <CardMedia
                                    component="img"
                                    height="80"
                                    image={(() => {
                                      const imageUrl = getMenuItemImageUrl(item.image, item.name, item.category, restaurant.cuisine)
                                      console.log(`RestaurantDetail - Item: ${item.name}, Original image: ${item.image}, Generated URL: ${imageUrl}`)
                                      return imageUrl
                                    })()}
                                    alt={item.name}
                                    sx={{
                                      borderRadius: 2,
                                      objectFit: 'cover',
                                      width: '100%',
                                    }}
                                    onError={(e) => {
                                      console.log(`RestaurantDetail - Image failed to load for ${item.name}:`, e.target.src)
                                      // Fallback to generated image if uploaded image fails to load
                                      const fallbackUrl = getMenuItemImageUrl(null, item.name, item.category, restaurant.cuisine)
                                      console.log(`RestaurantDetail - Using fallback URL:`, fallbackUrl)
                                      e.target.src = fallbackUrl
                                    }}
                                    onLoad={() => {
                                      console.log(`RestaurantDetail - Image loaded successfully for ${item.name}`)
                                    }}
                                  />
                                </Grid>
                                <Grid item xs={9} sm={6} md={6}>
                                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                    {item.name}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    {item.description}
                                  </Typography>
                                  <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600 }}>
                                    ₹{item.price}
                                  </Typography>
                                </Grid>

                                <Grid item xs={12} sm={4} md={4}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                                    {quantities[item._id] > 0 ? (
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <IconButton
                                          size="small"
                                          onClick={() => handleQuantityChange(item._id, -1)}
                                          sx={{ border: 1, borderColor: 'primary.main' }}
                                        >
                                          <MinusIcon className="h-4 w-4" />
                                        </IconButton>
                                        <Typography sx={{ minWidth: 20, textAlign: 'center' }}>
                                          {quantities[item._id]}
                                        </Typography>
                                        <IconButton
                                          size="small"
                                          onClick={() => handleQuantityChange(item._id, 1)}
                                          sx={{ border: 1, borderColor: 'primary.main' }}
                                        >
                                          <PlusIcon className="h-4 w-4" />
                                        </IconButton>
                                      </Box>
                                    ) : (
                                      <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => handleQuantityChange(item._id, 1)}
                                        startIcon={<PlusIcon className="h-4 w-4" />}
                                      >
                                        Add
                                      </Button>
                                    )}

                                    {quantities[item._id] > 0 && (
                                      <Button
                                        variant="contained"
                                        size="small"
                                        onClick={() => handleAddToCart(item)}
                                        startIcon={<ShoppingCartIcon className="h-4 w-4" />}
                                      >
                                        Add to Cart
                                      </Button>
                                    )}
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