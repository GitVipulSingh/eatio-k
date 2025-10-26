import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Rating,
  IconButton,
} from '@mui/material'
import {
  MapPinIcon,
  ClockIcon,
  HeartIcon,
  StarIcon,
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import { getRestaurantImageUrl } from '../../../common/utils/imageUtils'

const RestaurantCard = ({ restaurant }) => {
  const [isFavorite, setIsFavorite] = React.useState(false)

  const handleFavoriteClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsFavorite(!isFavorite)
  }

  // Generate consistent review count based on restaurant ID to prevent changes on re-render
  const getConsistentReviewCount = (restaurantId) => {
    if (!restaurantId) return 100
    // Use restaurant ID to generate a consistent "random" number
    const hash = restaurantId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
    return Math.abs(hash % 900) + 100 // 100-999 reviews
  }



  // Calculate estimated delivery time based on location (mock calculation)
  const getDeliveryTime = () => {
    return `${Math.floor(Math.random() * 15) + 25}-${Math.floor(Math.random() * 15) + 40} min`
  }

  const isOpen = restaurant.isOpen !== false // Default to open if not specified
  const isClosed = !isOpen

  return (
    <motion.div
      whileHover={{ y: isClosed ? 0 : -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        component={Link}
        to={`/restaurants/${restaurant._id}`}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          textDecoration: 'none',
          color: 'inherit',
          position: 'relative',
          overflow: 'hidden',
          filter: isClosed ? 'grayscale(100%)' : 'none',
          opacity: isClosed ? 0.7 : 1,
          pointerEvents: isClosed ? 'none' : 'auto',
          '&:hover': {
            boxShadow: isClosed ? 'none' : (theme) => theme.shadows[8],
          },
        }}
      >
        {/* Status Badge */}
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            zIndex: 2,
            backgroundColor: isOpen ? 'success.main' : 'error.main',
            color: 'white',
            px: 1,
            py: 0.5,
            borderRadius: 1,
            fontSize: '0.75rem',
            fontWeight: 600,
          }}
        >
          {isOpen ? 'Open' : 'Closed'}
        </Box>

        {/* Closed Overlay */}
        {isClosed && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 3,
            }}
          >
            <Box
              sx={{
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                px: 2,
                py: 1,
                borderRadius: 1,
                textAlign: 'center',
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Currently Closed
              </Typography>
              <Typography variant="caption">
                {restaurant.operatingHours 
                  ? `Opens at ${restaurant.operatingHours.open}`
                  : 'Check back later'
                }
              </Typography>
            </Box>
          </Box>
        )}

        {/* Favorite Button */}
        <IconButton
          onClick={handleFavoriteClick}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 1)',
            },
          }}
          size="small"
        >
          {isFavorite ? (
            <HeartSolidIcon className="h-4 w-4 text-red-500" />
          ) : (
            <HeartIcon className="h-4 w-4" />
          )}
        </IconButton>

        {/* Restaurant Image */}
        <Box sx={{ position: 'relative', overflow: 'hidden' }}>
          <CardMedia
            component="img"
            height="180"
            image={getRestaurantImageUrl(restaurant.documents?.restaurantPhoto, restaurant.name, restaurant.cuisine)}
            alt={restaurant.name}
            sx={{
              objectFit: 'cover',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
              },
            }}
          />
          
          {/* Delivery Time Badge */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              fontSize: '0.75rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            <ClockIcon className="h-3 w-3" />
            {getDeliveryTime()}
          </Box>

          {/* Offer Badge */}
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'success.main',
              color: 'white',
              px: 1,
              py: 0.5,
              borderRadius: 1,
              fontSize: '0.7rem',
              fontWeight: 600,
            }}
          >
            FREE DELIVERY
          </Box>
        </Box>

        <CardContent sx={{ flexGrow: 1, p: { xs: 1.5, sm: 2 } }}>
          {/* Line 1: Restaurant Name and Rating */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            mb: { xs: 0.8, sm: 1 }
          }}>
            <Typography
              variant="h6"
              component="h3"
              sx={{
                fontWeight: 700,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                lineHeight: 1.2,
                fontSize: { xs: '0.95rem', sm: '1rem' },
                flex: 1,
                mr: 1
              }}
            >
              {restaurant.name}
            </Typography>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 0.3,
                backgroundColor: 'success.main',
                color: 'white',
                px: { xs: 0.6, sm: 0.8 },
                py: 0.2,
                borderRadius: 1,
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                fontWeight: 600,
                flexShrink: 0
              }}
            >
              <StarIcon className="h-3 w-3" />
              {restaurant.averageRating?.toFixed(1) || '4.2'}
            </Box>
          </Box>

          {/* Line 2: Cuisine and Review Count */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: { xs: 0.8, sm: 1 }
          }}>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontSize: { xs: '0.8rem', sm: '0.85rem' },
                fontWeight: 500,
                flex: 1,
                mr: 1
              }}
            >
              {restaurant.cuisine?.slice(0, 2).join(', ')}
              {restaurant.cuisine?.length > 2 && ` +${restaurant.cuisine.length - 2}`}
            </Typography>
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ 
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                flexShrink: 0,
                display: { xs: 'none', sm: 'block' }
              }}
            >
              {getConsistentReviewCount(restaurant._id)}+ reviews
            </Typography>
          </Box>

          {/* Line 3: Location */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 0.5, 
            mb: { xs: 1.5, sm: 2 }
          }}>
            <span style={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>📍</span>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontSize: { xs: '0.75rem', sm: '0.8rem' },
              }}
            >
              {restaurant.address?.city || 'Location'}
            </Typography>
          </Box>

          {/* Delivery Info */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center',
            alignItems: 'center',
            pt: { xs: 1, sm: 1.5 },
            borderTop: '1px solid',
            borderColor: 'grey.100',
          }}>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'success.main', 
                fontWeight: 600, 
                fontSize: { xs: '0.7rem', sm: '0.75rem' }
              }}
            >
              {getDeliveryTime()}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default RestaurantCard