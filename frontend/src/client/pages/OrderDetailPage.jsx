import React from 'react'
import { useParams } from 'react-router-dom'
import { Container, Typography, Box } from '@mui/material'

const OrderDetailPage = () => {
  const { id } = useParams()

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box>
        <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
          Order Details
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Order details for ID: {id} will be implemented here
        </Typography>
      </Box>
    </Container>
  )
}

export default OrderDetailPage