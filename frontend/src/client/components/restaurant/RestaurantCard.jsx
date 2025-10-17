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
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import { getRestaurantImage } from '../../../common/utils/foodImages'

const RestaurantCard = ({ restaurant }) => {
  const [isFavorite, setIsFavorite] = React.useState(false)

  const handleFavoriteClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsFavorite(!isFavorite)
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
        <CardMedia
          component="img"
          height="160"
          image={getRestaurantImage(restaurant.cuisine)}
          alt={restaurant.name}
          sx={{
            objectFit: 'cover',
          }}
        />

        <CardContent sx={{ flexGrow: 1, p: 1.5 }}>
          {/* Restaurant Name */}
          <Typography
            variant="subtitle1"
            component="h3"
            sx={{
              fontWeight: 600,
              mb: 0.5,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              lineHeight: 1.3
            }}
          >
            {restaurant.name}
          </Typography>

          {/* Cuisine Tags */}
          <Box sx={{ mb: 1.5 }}>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {restaurant.cuisine?.slice(0, 3).join(', ')}
              {restaurant.cuisine?.length > 3 && ` +${restaurant.cuisine.length - 3} more`}
            </Typography>
          </Box>

          {/* Rating and Delivery Time */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 1,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Rating
                value={restaurant.averageRating || 4.2}
                precision={0.1}
                size="small"
                readOnly
                sx={{ fontSize: '1rem' }}
              />
              <Typography variant="caption" color="text.secondary">
                ({restaurant.averageRating?.toFixed(1) || '4.2'})
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <ClockIcon className="h-3 w-3 text-gray-500" />
              <Typography variant="caption" color="text.secondary">
                {getDeliveryTime()}
              </Typography>
            </Box>
          </Box>

          {/* Location and Menu Count */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <MapPinIcon className="h-3 w-3 text-gray-500" />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {restaurant.address?.city || 'Location'}
              </Typography>
            </Box>
            {restaurant.menuItems?.length > 0 && (
              <Typography variant="caption" color="text.secondary">
                {restaurant.menuItems.length} dishes
              </Typography>
            )}
          </Box>

          {/* Delivery Info */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" color="primary.main" fontWeight={500}>
              Free Delivery
            </Typography>
            <Typography variant="caption" color="success.main" fontWeight={500}>
              ₹200 for two
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default RestaurantCard