import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { 
  TextField, 
  InputAdornment, 
  IconButton, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Avatar, 
  Typography, 
  Box,
  Popper,
  ClickAwayListener
} from '@mui/material'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { setSearchQuery } from '../../store/slices/uiSlice'
import { useSearch } from '../../api/queries'
import { getRestaurantImage } from '../../../common/utils/foodImages'

const SearchBar = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { searchQuery } = useSelector(state => state.ui)
  const [localQuery, setLocalQuery] = useState(searchQuery)
  const [anchorEl, setAnchorEl] = useState(null)
  const [showResults, setShowResults] = useState(false)

  // Use search API with debounced query
  const { data: searchResults, isLoading } = useSearch(localQuery, {}, {
    enabled: localQuery.length > 2
  })

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      dispatch(setSearchQuery(localQuery))
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [localQuery, dispatch])

  const handleInputChange = (e) => {
    const value = e.target.value
    setLocalQuery(value)
    setAnchorEl(e.currentTarget)
    setShowResults(value.length > 2)
  }

  const handleClear = () => {
    setLocalQuery('')
    dispatch(setSearchQuery(''))
    setShowResults(false)
  }

  const handleResultClick = (restaurant) => {
    navigate(`/restaurants/${restaurant._id}`)
    setShowResults(false)
    setLocalQuery('')
  }

  const handleClickAway = () => {
    setShowResults(false)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && localQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(localQuery.trim())}`)
      setShowResults(false)
    }
  }

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box sx={{ position: 'relative', width: '100%' }}>
        <TextField
          fullWidth
          placeholder="Search restaurants, cuisines, or dishes..."
          value={localQuery}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </InputAdornment>
            ),
            endAdornment: localQuery && (
              <InputAdornment position="end">
                <IconButton onClick={handleClear} size="small">
                  <XMarkIcon className="h-4 w-4" />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'background.paper',
            },
          }}
        />

        {/* Search Results Dropdown */}
        <Popper
          open={showResults && Boolean(anchorEl)}
          anchorEl={anchorEl}
          placement="bottom-start"
          style={{ width: anchorEl?.offsetWidth, zIndex: 1300 }}
        >
          <Paper elevation={8} sx={{ mt: 1, maxHeight: 400, overflow: 'auto' }}>
            {isLoading ? (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Searching...
                </Typography>
              </Box>
            ) : searchResults?.restaurants?.length > 0 ? (
              <List dense>
                {searchResults.restaurants.slice(0, 5).map((restaurant) => (
                  <ListItem
                    key={restaurant._id}
                    button
                    onClick={() => handleResultClick(restaurant)}
                    sx={{ '&:hover': { backgroundColor: 'action.hover' } }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        src={getRestaurantImage(restaurant.cuisine)}
                        alt={restaurant.name}
                      >
                        🍽️
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={restaurant.name}
                      secondary={`${restaurant.cuisine?.join(', ')} • ${restaurant.address?.city}`}
                    />
                  </ListItem>
                ))}
                {searchResults.restaurants.length > 5 && (
                  <ListItem
                    button
                    onClick={() => {
                      navigate(`/search?q=${encodeURIComponent(localQuery)}`)
                      setShowResults(false)
                    }}
                    sx={{ backgroundColor: 'action.selected' }}
                  >
                    <ListItemText
                      primary={`View all ${searchResults.restaurants.length} results`}
                      sx={{ textAlign: 'center', color: 'primary.main' }}
                    />
                  </ListItem>
                )}
              </List>
            ) : localQuery.length > 2 ? (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No restaurants found for "{localQuery}"
                </Typography>
              </Box>
            ) : null}
          </Paper>
        </Popper>
      </Box>
    </ClickAwayListener>
  )
}

export default SearchBar