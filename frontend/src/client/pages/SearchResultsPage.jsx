import React, { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Container,
  Typography,
  Box,
  Grid,
  Alert,
  Skeleton,
  Card,
  CardContent,
} from '@mui/material'

import { useSearch } from '../api/queries'
import RestaurantCard from '../components/restaurant/RestaurantCard'

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''

  const { data: searchResults, isLoading, error } = useSearch(query)

  useEffect(() => {
    // Update page title
    document.title = query ? `Search: ${query} - Eatio` : 'Search - Eatio'
  }, [query])

  if (!query) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info">
          Please enter a search term to find restaurants and dishes.
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
            Search Results for "{query}"
          </Typography>
          {!isLoading && searchResults && (
            <Typography variant="body1" color="text.secondary">
              Found {searchResults.restaurants?.length || 0} restaurants
            </Typography>
          )}
        </Box>

        {isLoading ? (
          <Grid container spacing={3}>
            {[...Array(6)].map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card>
                  <Skeleton variant="rectangular" height={200} />
                  <CardContent>
                    <Skeleton variant="text" height={32} />
                    <Skeleton variant="text" height={24} />
                    <Skeleton variant="text" height={24} width="60%" />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : error ? (
          <Alert severity="error">
            Failed to search restaurants. Please try again later.
          </Alert>
        ) : searchResults?.restaurants?.length > 0 ? (
          <Grid container spacing={3}>
            {searchResults.restaurants.map((restaurant, index) => (
              <Grid item xs={12} sm={6} md={4} key={restaurant._id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <RestaurantCard restaurant={restaurant} />
                </motion.div>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
              No restaurants found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              We couldn't find any restaurants matching "{query}". 
              Try searching with different keywords or browse our featured restaurants.
            </Typography>
            <Box sx={{ fontSize: '3rem', mb: 2 }}>
              🔍🍽️
            </Box>
          </Box>
        )}
      </motion.div>
    </Container>
  )
}

export default SearchResultsPage