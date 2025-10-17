import React from 'react'
import { useParams } from 'react-router-dom'
import RestaurantDetailPage from '../../client/pages/RestaurantDetailPage'

// Wrapper component that uses the existing RestaurantDetailPage
const CustomerRestaurantDetailPage = () => {
  return <RestaurantDetailPage />
}

export default CustomerRestaurantDetailPage