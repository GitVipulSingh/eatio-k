import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import {
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon,
  DocumentIcon,
  CalendarIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

import { usePendingRestaurants, useApproveRestaurant, useRejectRestaurant } from '../../client/api/queries'
import LoadingSpinner from '../../common/components/LoadingSpinner'
import DocumentViewer from '../../components/DocumentViewer'

const RestaurantApproval = () => {
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [documentViewer, setDocumentViewer] = useState({ open: false, url: '', name: '', type: '' })

  const { data: pendingRestaurants, isLoading, refetch } = usePendingRestaurants()
  const approveRestaurantMutation = useApproveRestaurant()
  const rejectRestaurantMutation = useRejectRestaurant()

  const handleViewDetails = (restaurant) => {
    setSelectedRestaurant(restaurant)
    setDetailsDialogOpen(true)
  }

  // Helper function to open document viewer
  const openDocumentViewer = (url, name, type) => {
    setDocumentViewer({ open: true, url, name, type })
  }

  const closeDocumentViewer = () => {
    setDocumentViewer({ open: false, url: '', name: '', type: '' })
  }

  const handleApprove = async (restaurantId) => {
    try {
      await approveRestaurantMutation.mutateAsync(restaurantId)
      toast.success('Restaurant approved successfully!')
      refetch()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve restaurant')
    }
  }

  const handleRejectClick = (restaurant) => {
    setSelectedRestaurant(restaurant)
    setRejectDialogOpen(true)
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection')
      return
    }

    try {
      await rejectRestaurantMutation.mutateAsync({
        restaurantId: selectedRestaurant._id,
        reason: rejectionReason
      })
      toast.success('Restaurant rejected')
      setRejectDialogOpen(false)
      setRejectionReason('')
      setSelectedRestaurant(null)
      refetch()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject restaurant')
    }
  }

  if (isLoading) {
    return <LoadingSpinner message="Loading pending restaurants..." />
  }

  return (
    <>
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
            Restaurant Approvals
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Review and approve new restaurant applications
          </Typography>
        </Box>

        {pendingRestaurants?.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Restaurant</TableCell>
                  <TableCell>Owner</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Cuisine</TableCell>
                  <TableCell>Applied</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingRestaurants.map((restaurant, index) => (
                  <TableRow key={restaurant._id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ width: 40, height: 40 }}>
                          🍽️
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {restaurant.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            FSSAI: {restaurant.fssaiLicenseNumber}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {restaurant.owner?.name || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <EnvelopeIcon className="h-3 w-3 text-gray-500" />
                          <Typography variant="caption">
                            {restaurant.owner?.email || 'N/A'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PhoneIcon className="h-3 w-3 text-gray-500" />
                          <Typography variant="caption">
                            {restaurant.owner?.phone || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MapPinIcon className="h-3 w-3 text-gray-500" />
                        <Typography variant="caption">
                          {restaurant.address?.city}, {restaurant.address?.state}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {restaurant.cuisine?.slice(0, 2).map((cuisine) => (
                          <Chip
                            key={cuisine}
                            label={cuisine}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                        {restaurant.cuisine?.length > 2 && (
                          <Chip
                            label={`+${restaurant.cuisine.length - 2}`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarIcon className="h-3 w-3 text-gray-500" />
                        <Typography variant="caption">
                          {new Date(restaurant.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<EyeIcon className="h-3 w-3" />}
                          onClick={() => handleViewDetails(restaurant)}
                        >
                          View
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<CheckCircleIcon className="h-3 w-3" />}
                          onClick={() => handleApprove(restaurant._id)}
                          disabled={approveRestaurantMutation.isPending}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<XCircleIcon className="h-3 w-3" />}
                          onClick={() => handleRejectClick(restaurant)}
                          disabled={rejectRestaurantMutation.isPending}
                        >
                          Reject
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Box sx={{ fontSize: '4rem', mb: 2 }}>✅</Box>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              No pending restaurant applications
            </Typography>
            <Typography variant="body2" color="text.secondary">
              All restaurant applications have been reviewed.
            </Typography>
          </Box>
        )}

        {/* Restaurant Details Dialog */}
        <Dialog
          open={detailsDialogOpen}
          onClose={() => setDetailsDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Restaurant Application Details
          </DialogTitle>
          <DialogContent>
            {selectedRestaurant && (
              <Box sx={{ pt: 2 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                      Restaurant Information
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText
                          primary="Restaurant Name"
                          secondary={selectedRestaurant.name}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Description"
                          secondary={selectedRestaurant.description || 'No description provided'}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="FSSAI License Number"
                          secondary={selectedRestaurant.fssaiLicenseNumber}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Cuisine Types"
                          secondary={selectedRestaurant.cuisine?.join(', ') || 'Not specified'}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Average Rating"
                          secondary={selectedRestaurant.averageRating || 0}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                      Owner Information
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText
                          primary="Owner Name"
                          secondary={selectedRestaurant.owner?.name || 'Not provided'}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Email"
                          secondary={selectedRestaurant.owner?.email || 'Not provided'}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Phone"
                          secondary={selectedRestaurant.owner?.phone || 'Not provided'}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                      Address Details
                    </Typography>
                    <Typography variant="body2">
                      {selectedRestaurant.address?.street}<br />
                      {selectedRestaurant.address?.city}, {selectedRestaurant.address?.state}<br />
                      Pincode: {selectedRestaurant.address?.pincode}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                      Documents Submitted
                    </Typography>
                    
                    {selectedRestaurant.documents && Object.keys(selectedRestaurant.documents).length > 0 ? (
                      <Grid container spacing={2}>
                        {/* FSSAI License */}
                        <Grid item xs={12} sm={6}>
                          <Card variant="outlined" sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <DocumentIcon className="h-5 w-5 mr-2 text-blue-500" />
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                FSSAI License
                              </Typography>
                            </Box>
                            {selectedRestaurant.documents.fssaiLicense ? (
                              <Box>
                                <Typography variant="body2" color="success.main" sx={{ mb: 1 }}>
                                  ✅ Document Uploaded
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                  Filename: {selectedRestaurant.documents.fssaiLicense}
                                </Typography>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => {
                                    openDocumentViewer(
                                      selectedRestaurant.documents.fssaiLicense,
                                      `FSSAI License - ${selectedRestaurant.name}`,
                                      'FSSAI License Document'
                                    )
                                  }}
                                >
                                  View Document
                                </Button>
                              </Box>
                            ) : (
                              <Typography variant="body2" color="error.main">
                                ❌ No FSSAI License uploaded
                              </Typography>
                            )}
                          </Card>
                        </Grid>

                        {/* Restaurant Photo */}
                        <Grid item xs={12} sm={6}>
                          <Card variant="outlined" sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <PhotoIcon className="h-5 w-5 mr-2 text-green-500" />
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                Restaurant Photo
                              </Typography>
                            </Box>
                            {selectedRestaurant.documents.restaurantPhoto ? (
                              <Box>
                                <Typography variant="body2" color="success.main" sx={{ mb: 1 }}>
                                  ✅ Photo Uploaded
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                  Filename: {selectedRestaurant.documents.restaurantPhoto}
                                </Typography>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => {
                                    openDocumentViewer(
                                      selectedRestaurant.documents.restaurantPhoto,
                                      `Restaurant Photo - ${selectedRestaurant.name}`,
                                      'Restaurant Photo'
                                    )
                                  }}
                                >
                                  View Photo
                                </Button>
                              </Box>
                            ) : (
                              <Typography variant="body2" color="error.main">
                                ❌ No restaurant photo uploaded
                              </Typography>
                            )}
                          </Card>
                        </Grid>
                      </Grid>
                    ) : (
                      <Alert severity="warning">
                        No documents have been uploaded by this restaurant.
                      </Alert>
                    )}
                    
                    {/* Document Requirements Info */}
                    <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Document Requirements:</strong><br />
                        • FSSAI License: Required for food business operation<br />
                        • Restaurant Photo: Helps customers identify the restaurant<br />
                        • Both documents are recommended but not mandatory for approval
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailsDialogOpen(false)}>
              Close
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={() => {
                handleApprove(selectedRestaurant._id)
                setDetailsDialogOpen(false)
              }}
              disabled={approveRestaurantMutation.isPending}
            >
              Approve Restaurant
            </Button>
          </DialogActions>
        </Dialog>

        {/* Rejection Dialog */}
        <Dialog
          open={rejectDialogOpen}
          onClose={() => setRejectDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Reject Restaurant Application
          </DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              Please provide a reason for rejecting this restaurant application.
            </Alert>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Rejection Reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Please explain why this application is being rejected..."
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleReject}
              disabled={rejectRestaurantMutation.isPending || !rejectionReason.trim()}
            >
              Reject Application
            </Button>
          </DialogActions>
        </Dialog>
      </motion.div>
    </Container>
    
    {/* Document Viewer Modal */}
    <DocumentViewer
      open={documentViewer.open}
      onClose={closeDocumentViewer}
      documentUrl={documentViewer.url}
      documentName={documentViewer.name}
      documentType={documentViewer.type}
    />
    </>
  )
}

export default RestaurantApproval