// NEW FILE - ADDITIVE RATING SYSTEM COMPONENT
import React, { useState } from 'react'
import { Button } from '@mui/material'
import { StarIcon } from '@heroicons/react/24/outline'
import RatingModal from './RatingModal'
import { useCanReviewOrder } from '../../api/queries'

const RateOrderButton = ({ order, restaurant }) => {
  const [modalOpen, setModalOpen] = useState(false)
  
  // Check if user can review this order
  const { data: canReviewData } = useCanReviewOrder(order._id, {
    enabled: order.status === 'Delivered'
  })

  // Only show button for delivered orders that can be reviewed
  if (order.status !== 'Delivered' || !canReviewData?.canReview) {
    return null
  }

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        startIcon={<StarIcon className="h-4 w-4" />}
        onClick={() => setModalOpen(true)}
        sx={{
          borderColor: 'warning.main',
          color: 'warning.main',
          '&:hover': {
            borderColor: 'warning.dark',
            backgroundColor: 'warning.light',
          }
        }}
      >
        Rate Order
      </Button>

      <RatingModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        order={order}
        restaurant={restaurant}
      />
    </>
  )
}

export default RateOrderButton