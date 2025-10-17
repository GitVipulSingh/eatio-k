import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Link,
} from '@mui/material'
import {
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

import { usePendingRestaurants, useUpdateRestaurantStatus } from '../api/queries'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const SuperAdminDashboard = () => {
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)
  const [reviewDialog, setReviewDialog] = useState(false)
  const [status, setStatus] = useState('')
  const [remarks, setRemarks] = useState('')

  const { data: pendingRestaurants, isLoading } = usePendingRestaurants()
  const updateStatusMutation = useUpdateRestaurantStatus()

  const handleReviewRestaurant = (restaurant) => {
    setSelectedRestaurant(restaurant)
    setStatus('')
    setRemarks('')
    setReviewDialog(true)
  }

  const handleStatusUpdate = async () => {
    if (!status) {
      toast.error('Please select a status')
      return
    }

    try {
      await updateStatusMutation.mutateAsync({
        restaurantId: selectedRestaurant._id,
        status,
        remarks
      })
      
      toast.success(`Restaurant ${status === 'approved' ? 'approved' : 'rejected'} successfully`)
      setReviewDialog(false)
    } catch (error) {
      toast.error('Failed to update restaurant status')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success'
      case 'pending_approval': return 'warning'
      case 'rejected': return 'error'
      default: return 'default'
    }
  }

  const downloadDocument = (url, filename) => {
    if (url) {
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  if (isLoading) {
    return <LoadingSpinner message="Loading admin dashboard..." fullScreen />
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
            Super Admin Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage restaurant approvals and platform settings
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                  {pendingRestaurants?.filter(r => r.status === 'pending_approval')?.length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending Approvals
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                  {pendingRestaurants?.filter(r => r.status === 'approved')?.length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Approved Restaurants
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'error.main' }}>
                  {pendingRestaurants?.filter(r => r.status === 'rejected')?.length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Rejected Applications
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                  {pendingRestaurants?.length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Applications
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Restaurant Applications Table */}
        <Card>
          <CardContent>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
              Restaurant Applications
            </Typography>

            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Restaurant Name</TableCell>
                    <TableCell>Owner</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Cuisine</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Applied Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingRestaurants?.map((restaurant) => (
                    <TableRow key={restaurant._id}>
                      <TableCell>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {restaurant.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {restaurant.owner?.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {restaurant.owner?.email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {restaurant.address?.city}, {restaurant.address?.pincode}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {restaurant.cuisine?.slice(0, 2).map((cuisine) => (
                            <Chip key={cuisine} label={cuisine} size="small" variant="outlined" />
                          ))}
                          {restaurant.cuisine?.length > 2 && (
                            <Chip label={`+${restaurant.cuisine.length - 2}`} size="small" />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={restaurant.status.replace('_', ' ').toUpperCase()}
                          color={getStatusColor(restaurant.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(restaurant.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleReviewRestaurant(restaurant)}
                          color="primary"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {(!pendingRestaurants || pendingRestaurants.length === 0) && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                  No restaurant applications
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Restaurant applications will appear here for review
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Review Restaurant Dialog */}
        <Dialog
          open={reviewDialog}
          onClose={() => setReviewDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Review Restaurant Application - {selectedRestaurant?.name}
          </DialogTitle>
          <DialogContent>
            {selectedRestaurant && (
              <Box sx={{ pt: 2 }}>
                {/* Restaurant Details */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Restaurant Name
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {selectedRestaurant.name}
                    </Typography>

                    <Typography variant="subtitle2" color="text.secondary">
                      Owner Details
                    </Typography>
                    <Typography variant="body2">
                      {selectedRestaurant.owner?.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedRestaurant.owner?.email}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {selectedRestaurant.owner?.phone}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Address
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {selectedRestaurant.address?.street}<br />
                      {selectedRestaurant.address?.city} - {selectedRestaurant.address?.pincode}
                    </Typography>

                    <Typography variant="subtitle2" color="text.secondary">
                      Cuisine Types
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
                      {selectedRestaurant.cuisine?.map((cuisine) => (
                        <Chip key={cuisine} label={cuisine} size="small" />
                      ))}
                    </Box>
                  </Grid>
                </Grid>

                {/* Documents Section */}
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Documents
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      FSSAI License: {selectedRestaurant.fssaiLicenseNumber}
                    </Typography>
                    {selectedRestaurant.documents?.fssaiLicenseUrl && (
                      <Button
                        size="small"
                        startIcon={<DocumentArrowDownIcon className="h-4 w-4" />}
                        onClick={() => downloadDocument(
                          selectedRestaurant.documents.fssaiLicenseUrl,
                          'fssai-license.pdf'
                        )}
                      >
                        Download FSSAI License
                      </Button>
                    )}
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    {selectedRestaurant.gstNumber && (
                      <>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          GST Number: {selectedRestaurant.gstNumber}
                        </Typography>
                        {selectedRestaurant.documents?.gstCertificateUrl && (
                          <Button
                            size="small"
                            startIcon={<DocumentArrowDownIcon className="h-4 w-4" />}
                            onClick={() => downloadDocument(
                              selectedRestaurant.documents.gstCertificateUrl,
                              'gst-certificate.pdf'
                            )}
                          >
                            Download GST Certificate
                          </Button>
                        )}
                      </>
                    )}
                  </Grid>

                  {selectedRestaurant.documents?.shopEstablishmentUrl && (
                    <Grid item xs={12} sm={6}>
                      <Button
                        size="small"
                        startIcon={<DocumentArrowDownIcon className="h-4 w-4" />}
                        onClick={() => downloadDocument(
                          selectedRestaurant.documents.shopEstablishmentUrl,
                          'shop-establishment.pdf'
                        )}
                      >
                        Download Shop Establishment
                      </Button>
                    </Grid>
                  )}

                  {selectedRestaurant.documents?.ownerPhotoUrl && (
                    <Grid item xs={12} sm={6}>
                      <Button
                        size="small"
                        startIcon={<DocumentArrowDownIcon className="h-4 w-4" />}
                        onClick={() => downloadDocument(
                          selectedRestaurant.documents.ownerPhotoUrl,
                          'owner-photo.jpg'
                        )}
                      >
                        Download Owner Photo
                      </Button>
                    </Grid>
                  )}
                </Grid>

                {/* Review Form */}
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Decision</InputLabel>
                      <Select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        label="Decision"
                      >
                        <MenuItem value="approved">Approve</MenuItem>
                        <MenuItem value="rejected">Reject</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Remarks (Optional)"
                      multiline
                      rows={3}
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Add any comments or feedback for the restaurant owner..."
                    />
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setReviewDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleStatusUpdate}
              disabled={updateStatusMutation.isPending || !status}
              color={status === 'approved' ? 'success' : 'error'}
            >
              {updateStatusMutation.isPending ? (
                <LoadingSpinner size={20} />
              ) : (
                `${status === 'approved' ? 'Approve' : 'Reject'} Restaurant`
              )}
            </Button>
          </DialogActions>
        </Dialog>
      </motion.div>
    </Container>
  )
}

export default SuperAdminDashboard