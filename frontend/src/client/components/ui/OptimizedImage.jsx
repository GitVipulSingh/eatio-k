import React, { useState } from 'react'
import { Box, Skeleton } from '@mui/material'
import { motion } from 'framer-motion'

const OptimizedImage = ({ 
  src, 
  alt, 
  width, 
  height, 
  borderRadius = 0,
  objectFit = 'cover',
  fallbackSrc = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
  ...props 
}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [imageSrc, setImageSrc] = useState(src)

  const handleLoad = () => {
    setIsLoading(false)
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
    if (imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc)
      setHasError(false)
    }
  }

  return (
    <Box
      sx={{
        position: 'relative',
        width: width || '100%',
        height: height || 'auto',
        borderRadius,
        overflow: 'hidden',
        ...props.sx
      }}
      {...props}
    >
      {isLoading && (
        <Skeleton
          variant="rectangular"
          width="100%"
          height={height || 200}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            borderRadius,
          }}
        />
      )}
      
      <motion.img
        src={imageSrc}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 0.3 }}
        style={{
          width: '100%',
          height: '100%',
          objectFit,
          borderRadius,
          display: isLoading ? 'none' : 'block',
        }}
        loading="lazy"
      />
      
      {hasError && imageSrc === fallbackSrc && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'grey.100',
            color: 'grey.500',
            fontSize: '2rem',
          }}
        >
          🍽️
        </Box>
      )}
    </Box>
  )
}

export default OptimizedImage