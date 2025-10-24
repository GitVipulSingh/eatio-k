// NEW FILE - ADDITIVE RATING SYSTEM COMPONENT
import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  Rating,
  Alert,
} from '@mui/material'
import { StarIcon } from '@heroicons/react/24/solid'
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import { useSubmitReview } from '../../api/queries'

const RatingModal = ({ open, onClose, order, restaurant }) => {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [hover, setHover] = useState(-1)

  const submitReviewMutation = useSubmitReview()

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }

    try {
      await submitReviewMutation.mutateAsync({
        orderId: order._id,
        rating,
        comment,
      })
      
      toast.success('Thank you for your review!')
      onClose()
      setRating(0)
      setComment('')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review')
    }
  }

  const handleClose = () => {
    onClose()
    setRating(0)
    setComment('')
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            Rate Your Experience
          </Typography>
          <Typography variant="body2" color="text.secondary">
            How was your order from {restaurant?.name}?
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ py: 2 }}>
          {/* Star Rating */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
              Tap to rate:
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Box
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(-1)}
                  sx={{
                    cursor: 'pointer',
                    color: star <= (hover !== -1 ? hover : rating) ? '#fbbf24' : '#e5e7eb',
                    transition: 'color 0.2s ease',
                    '&:hover': {
                      transform: 'scale(1.1)',
                    }
                  }}
                >
                  <StarIcon style={{ width: '2rem', height: '2rem' }} />
                </Box>
              ))}
            </Box>
            
            {rating > 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent'}
              </Typography>
            )}
          </Box>

          {/* Comment Field */}
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Share your experience (optional)"
            placeholder="Tell others about your experience with this restaurant..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            inputProps={{ maxLength: 500 }}
            helperText={`${comment.length}/500 characters`}
          />

          {/* Order Details */}
          <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Order #{order?._id?.slice(-6)} • {order?.items?.length} items • ₹{order?.totalAmount}
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={rating === 0 || submitReviewMutation.isPending}
          sx={{ minWidth: 120 }}
        >
          {submitReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default RatingModal