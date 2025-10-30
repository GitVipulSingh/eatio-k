import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Badge,
  IconButton,
  Tabs,
  Tab,
} from '@mui/material'
import {
  EyeIcon,
  ClockIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  BellIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import { io } from 'socket.io-client'

import { 
  useRestaurantOrders, 
  useUpdateOrderStatus 
} from '../../client/api/queries'
import LoadingSpinner from '../../common/components/LoadingSpinner'

const OrderManagement = () => {
  console.log('🚀 [ORDER_MGMT] Component initializing...')
  
  const navigate = useNavigate()
  const location = useLocation()
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const [socket, setSocket] = useState(null)
  const [newOrdersCount, setNewOrdersCount] = useState(0)
  const [activeTab, setActiveTab] = useState(0)
  
  // Confirmation dialog states
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState(null)
  const [lastStatusChange, setLastStatusChange] = useState(null)
  const [undoTimeLeft, setUndoTimeLeft] = useState(0)
  const [processingOrders, setProcessingOrders] = useState(new Set())
  const [statusHistory, setStatusHistory] = useState([])

  const { data: orders, isLoading, refetch, error } = useRestaurantOrders()
  const updateOrderStatusMutation = useUpdateOrderStatus()

  // Force refresh on component mount
  useEffect(() => {
    console.log('🔄 [ORDER_MGMT] Component mounted, forcing data refresh')
    refetch()
  }, [])

  // Handle URL parameters for filtering
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    const filterParam = urlParams.get('filter')
    
    if (filterParam) {
      const filterMap = {
        'pending': { filter: 'Pending', tab: 1 },
        'confirmed': { filter: 'Confirmed', tab: 2 },
        'preparing': { filter: 'Preparing', tab: 3 },
        'out-for-delivery': { filter: 'Out for Delivery', tab: 4 },
        'delivered': { filter: 'Delivered', tab: 5 },
        'cancelled': { filter: 'Cancelled', tab: 6 }
      }
      
      const mapping = filterMap[filterParam.toLowerCase()]
      if (mapping) {
        setStatusFilter(mapping.filter)
        setActiveTab(mapping.tab)
        console.log(`🔍 [ORDER_MGMT] URL filter applied: ${mapping.filter}`)
      }
    }
  }, [location.search])

  // Debug logging
  useEffect(() => {
    console.log('🔍 [ORDER_MGMT] Component mounted/updated')
    console.log('🔍 [ORDER_MGMT] Current location:', location.pathname)
    console.log('🔍 [ORDER_MGMT] Orders data:', orders)
    console.log('🔍 [ORDER_MGMT] Loading state:', isLoading)
    console.log('🔍 [ORDER_MGMT] Error state:', error)
  }, [orders, isLoading, error, location.pathname])

  // Keyboard shortcut for undo (Ctrl+Z)
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === 'z' && lastStatusChange && undoTimeLeft > 0) {
        event.preventDefault()
        handleUndo()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [lastStatusChange, undoTimeLeft])

  const orderStatuses = [
    { value: 'Pending', label: 'Pending', color: 'warning', icon: ClockIcon },
    { value: 'Confirmed', label: 'Confirmed', color: 'info', icon: CheckCircleIcon },
    { value: 'Preparing', label: 'Preparing', color: 'primary', icon: ClockIcon },
    { value: 'Out for Delivery', label: 'Out for Delivery', color: 'secondary', icon: TruckIcon },
    { value: 'Delivered', label: 'Delivered', color: 'success', icon: CheckCircleIcon },
    { value: 'Cancelled', label: 'Cancelled', color: 'error', icon: XCircleIcon },
  ]

  // Socket.IO setup for real-time updates
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'
    console.log('🔌 [SOCKET] Connecting to:', socketUrl)
    const newSocket = io(socketUrl)
    setSocket(newSocket)

    // Listen for new orders
    newSocket.on('new_order', (order) => {
      toast.success(`New order received! Order #${order._id.slice(-8)}`)
      setNewOrdersCount(prev => prev + 1)
      refetch()
    })

    // Listen for order status updates
    newSocket.on('order_status_updated', (updatedOrder) => {
      toast.info(`Order #${updatedOrder._id.slice(-8)} status updated`)
      refetch()
    })

    return () => {
      newSocket.close()
    }
  }, [refetch])

  // Show confirmation dialog before status update
  const handleStatusUpdateRequest = (orderId, newStatus, currentStatus) => {
    const order = ordersArray.find(o => o._id === orderId)
    setPendingStatusUpdate({
      orderId,
      newStatus,
      currentStatus,
      orderNumber: order?._id.slice(-8).toUpperCase(),
      customerName: order?.user?.name || 'Customer'
    })
    setConfirmDialogOpen(true)
  }

  // Actual status update after confirmation
  const handleStatusUpdate = async (orderId, newStatus, currentStatus) => {
    // Prevent duplicate processing
    if (processingOrders.has(orderId)) {
      toast.error('Order is already being processed')
      return
    }

    try {
      console.log(`📝 [ORDER_MGMT] Updating order ${orderId} to status: ${newStatus}`)
      
      // Add to processing set
      setProcessingOrders(prev => new Set([...prev, orderId]))
      
      // Validate status value
      const validStatuses = ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled']
      if (!validStatuses.includes(newStatus)) {
        console.error(`❌ [ORDER_MGMT] Invalid status: ${newStatus}`)
        toast.error(`Invalid status: ${newStatus}`)
        return
      }
      
      await updateOrderStatusMutation.mutateAsync({
        orderId,
        status: newStatus
      })
      
      // Store for undo functionality
      const statusChange = {
        orderId,
        oldStatus: currentStatus,
        newStatus,
        timestamp: Date.now(),
        orderNumber: ordersArray.find(o => o._id === orderId)?._id.slice(-8).toUpperCase()
      }
      
      setLastStatusChange(statusChange)
      
      // Add to status history
      setStatusHistory(prev => [statusChange, ...prev.slice(0, 9)]) // Keep last 10 changes
      
      // Start undo countdown (10 seconds)
      setUndoTimeLeft(10)
      const undoTimer = setInterval(() => {
        setUndoTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(undoTimer)
            setLastStatusChange(null)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      
      // Emit socket event for real-time updates
      if (socket) {
        socket.emit('order_status_update', { orderId, status: newStatus })
      }
      
      toast.success(
        <Box>
          <Typography variant="body2">
            Order status updated to {newStatus}
          </Typography>
          {lastStatusChange && (
            <Button
              size="small"
              onClick={handleUndo}
              sx={{ mt: 1, color: 'white' }}
            >
              Undo ({undoTimeLeft}s)
            </Button>
          )}
        </Box>,
        { duration: 10000 }
      )
      
      refetch()
    } catch (error) {
      console.error(`❌ [ORDER_MGMT] Status update error:`, error)
      toast.error(error.response?.data?.message || 'Failed to update order status')
    } finally {
      // Remove from processing set
      setProcessingOrders(prev => {
        const newSet = new Set(prev)
        newSet.delete(orderId)
        return newSet
      })
    }
  }

  // Undo last status change
  const handleUndo = async () => {
    if (!lastStatusChange) return
    
    try {
      await updateOrderStatusMutation.mutateAsync({
        orderId: lastStatusChange.orderId,
        status: lastStatusChange.oldStatus
      })
      
      toast.success(`Status reverted to ${lastStatusChange.oldStatus}`)
      setLastStatusChange(null)
      setUndoTimeLeft(0)
      refetch()
    } catch (error) {
      toast.error('Failed to undo status change')
    }
  }

  // Confirm status update
  const handleConfirmStatusUpdate = () => {
    if (pendingStatusUpdate) {
      handleStatusUpdate(
        pendingStatusUpdate.orderId,
        pendingStatusUpdate.newStatus,
        pendingStatusUpdate.currentStatus
      )
    }
    setConfirmDialogOpen(false)
    setPendingStatusUpdate(null)
  }

  const getStatusColor = (status) => {
    const statusObj = orderStatuses.find(s => s.value === status)
    return statusObj?.color || 'default'
  }

  const getStatusIcon = (status) => {
    const statusObj = orderStatuses.find(s => s.value === status)
    const IconComponent = statusObj?.icon || ClockIcon
    return <IconComponent className="h-4 w-4" />
  }

  // Ensure orders is an array - MOVED UP BEFORE USAGE
  const ordersArray = Array.isArray(orders) ? orders : []
  console.log('🔍 [ORDER_MGMT] Raw orders data:', orders)
  console.log('🔍 [ORDER_MGMT] Orders array:', ordersArray)
  console.log('🔍 [ORDER_MGMT] Orders array length:', ordersArray.length)

  const filteredOrders = ordersArray.filter(order => {
    if (statusFilter === 'all') return true
    return order.status === statusFilter
  })

  const ordersByStatus = {
    pending: ordersArray.filter(o => o.status === 'Pending').length,
    confirmed: ordersArray.filter(o => o.status === 'Confirmed').length,
    preparing: ordersArray.filter(o => o.status === 'Preparing').length,
    out_for_delivery: ordersArray.filter(o => o.status === 'Out for Delivery').length,
    delivered: ordersArray.filter(o => o.status === 'Delivered').length,
    cancelled: ordersArray.filter(o => o.status === 'Cancelled').length,
  }

  const getNextStatus = (currentStatus) => {
    const statusFlow = ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered']
    const currentIndex = statusFlow.indexOf(currentStatus)
    return currentIndex < statusFlow.length - 1 ? statusFlow[currentIndex + 1] : null
  }

  const canUpdateStatus = (currentStatus) => {
    return !['Delivered', 'Cancelled'].includes(currentStatus)
  }

  if (isLoading) {
    return <LoadingSpinner message="Loading orders..." />
  }

  if (error) {
    console.error('🔍 [ORDER_MGMT] Error loading orders:', error)
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load orders: {error.response?.data?.message || error.message}
        </Alert>
        <Button variant="contained" onClick={() => refetch()}>
          Retry
        </Button>
      </Container>
    )
  }

  // ordersArray already declared above

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/admin/dashboard')}
                sx={{ minWidth: 'auto', px: 2 }}
              >
                ← Back to Dashboard
              </Button>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
                Order Management
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary">
              Manage incoming orders and update their status in real-time
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Badge badgeContent={newOrdersCount} color="error">
              <IconButton onClick={() => setNewOrdersCount(0)}>
                <BellIcon className="h-6 w-6" />
              </IconButton>
            </Badge>
            
            {statusHistory.length > 0 && (
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  toast(
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>Recent Status Changes:</Typography>
                      {statusHistory.slice(0, 3).map((change, index) => (
                        <Typography key={index} variant="caption" sx={{ display: 'block' }}>
                          #{change.orderNumber}: {change.oldStatus} → {change.newStatus}
                        </Typography>
                      ))}
                    </Box>,
                    { duration: 5000 }
                  )
                }}
              >
                History ({statusHistory.length})
              </Button>
            )}
            
            <IconButton onClick={refetch}>
              <ArrowPathIcon className="h-6 w-6" />
            </IconButton>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {orderStatuses.map((status) => (
            <Grid item xs={12} sm={6} md={2} key={status.value}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                    <status.icon className={`h-6 w-6 text-${status.color}-500`} />
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: `${status.color}.main` }}>
                    {ordersByStatus[status.value]}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {status.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Filter Tabs */}
        <Box sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => {
              setActiveTab(newValue)
              const statuses = ['all', 'Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled']
              const newFilter = statuses[newValue]
              setStatusFilter(newFilter)
              
              // Update URL without page reload
              const urlParams = new URLSearchParams(location.search)
              if (newFilter === 'all') {
                urlParams.delete('filter')
              } else {
                const filterParam = newFilter.toLowerCase().replace(' ', '-')
                urlParams.set('filter', filterParam)
              }
              
              const newUrl = `${location.pathname}${urlParams.toString() ? '?' + urlParams.toString() : ''}`
              window.history.replaceState({}, '', newUrl)
            }}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label={`All Orders (${ordersArray.length})`} />
            <Tab label={`Pending (${ordersByStatus.pending})`} />
            <Tab label={`Confirmed (${ordersByStatus.confirmed})`} />
            <Tab label={`Preparing (${ordersByStatus.preparing})`} />
            <Tab label={`Out for Delivery (${ordersByStatus.out_for_delivery})`} />
            <Tab label={`Delivered (${ordersByStatus.delivered})`} />
            <Tab label={`Cancelled (${ordersByStatus.cancelled})`} />
          </Tabs>
        </Box>

        {/* Orders Table */}
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 8 }}>
              <Box sx={{ fontSize: '4rem', mb: 2 }}>📋</Box>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                No orders found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {statusFilter === 'all' 
                  ? 'No orders have been placed yet'
                  : `No orders with status "${statusFilter}"`
                }
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Order Time</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                        #{order._id.slice(-8).toUpperCase()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {order.user?.name?.charAt(0) || 'U'}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {order.user?.name || 'Customer'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {order.user?.phone || 'No phone'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {order.items?.length} items
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {order.items?.slice(0, 2).map(item => item.name).join(', ')}
                        {order.items?.length > 2 && '...'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        ₹{order.totalAmount}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={order.status}
                        color={getStatusColor(order.status)}
                        size="small"
                        icon={getStatusIcon(order.status)}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(order.createdAt).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedOrder(order)
                            setDetailsDialogOpen(true)
                          }}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </IconButton>
                        {canUpdateStatus(order.status) && getNextStatus(order.status) && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleStatusUpdateRequest(
                              order._id, 
                              getNextStatus(order.status),
                              order.status
                            )}
                            disabled={updateOrderStatusMutation.isPending || processingOrders.has(order._id)}
                          >
                            {processingOrders.has(order._id) ? (
                              <LoadingSpinner size={16} />
                            ) : (
                              getNextStatus(order.status)
                            )}
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Order Details Dialog */}
        <Dialog
          open={detailsDialogOpen}
          onClose={() => setDetailsDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Order Details - #{selectedOrder?._id.slice(-8).toUpperCase()}
          </DialogTitle>
          <DialogContent>
            {selectedOrder && (
              <Box>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                      Customer Information
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText
                          primary="Name"
                          secondary={selectedOrder.user?.name || 'N/A'}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Phone"
                          secondary={selectedOrder.user?.phone || 'N/A'}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Email"
                          secondary={selectedOrder.user?.email || 'N/A'}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                      Order Information
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText
                          primary="Order ID"
                          secondary={`#${selectedOrder._id.slice(-8).toUpperCase()}`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Status"
                          secondary={
                            <Chip
                              label={selectedOrder.status}
                              color={getStatusColor(selectedOrder.status)}
                              size="small"
                            />
                          }
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Order Time"
                          secondary={new Date(selectedOrder.createdAt).toLocaleString()}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Total Amount"
                          secondary={`₹${selectedOrder.totalAmount}`}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                      Order Items
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Item</TableCell>
                            <TableCell>Quantity</TableCell>
                            <TableCell>Price</TableCell>
                            <TableCell>Total</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedOrder.items?.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.name}</TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell>₹{item.price}</TableCell>
                              <TableCell>₹{item.quantity * item.price}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                  {canUpdateStatus(selectedOrder.status) && (
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                        Update Order Status
                      </Typography>
                      <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select
                          value={selectedOrder.status}
                          label="Status"
                          onChange={(e) => handleStatusUpdateRequest(
                            selectedOrder._id, 
                            e.target.value,
                            selectedOrder.status
                          )}
                        >
                          {orderStatuses.map((status) => (
                            <MenuItem key={status.value} value={status.value}>
                              {status.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Status Update Confirmation Dialog */}
        <Dialog
          open={confirmDialogOpen}
          onClose={() => setConfirmDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ 
                width: 40, 
                height: 40, 
                borderRadius: '50%', 
                backgroundColor: 'warning.light',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                ⚠️
              </Box>
              Confirm Status Update
            </Box>
          </DialogTitle>
          <DialogContent>
            {pendingStatusUpdate && (
              <Box>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Are you sure you want to update the status of order{' '}
                  <strong>#{pendingStatusUpdate.orderNumber}</strong> for{' '}
                  <strong>{pendingStatusUpdate.customerName}</strong>?
                </Typography>
                
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2, 
                  p: 2, 
                  backgroundColor: 'grey.50',
                  borderRadius: 1,
                  mb: 2
                }}>
                  <Chip 
                    label={pendingStatusUpdate.currentStatus} 
                    color="default" 
                    size="small" 
                  />
                  <Typography>→</Typography>
                  <Chip 
                    label={pendingStatusUpdate.newStatus} 
                    color="primary" 
                    size="small" 
                  />
                </Box>

                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    💡 <strong>Tip:</strong> You'll have 10 seconds to undo this change after confirming.
                  </Typography>
                </Alert>

                {pendingStatusUpdate.newStatus === 'Delivered' && (
                  <Alert severity="warning" sx={{ mt: 1 }}>
                    <Typography variant="body2">
                      ⚠️ <strong>Warning:</strong> Once marked as "Delivered", this order will be considered complete.
                    </Typography>
                  </Alert>
                )}

                {pendingStatusUpdate.newStatus === 'Cancelled' && (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    <Typography variant="body2">
                      🚫 <strong>Warning:</strong> Cancelling this order cannot be undone easily.
                    </Typography>
                  </Alert>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setConfirmDialogOpen(false)}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmStatusUpdate}
              variant="contained"
              color={pendingStatusUpdate?.newStatus === 'Cancelled' ? 'error' : 'primary'}
              disabled={updateOrderStatusMutation.isPending}
            >
              {updateOrderStatusMutation.isPending ? (
                <LoadingSpinner size={20} />
              ) : (
                `Update to ${pendingStatusUpdate?.newStatus}`
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Undo Notification */}
        {lastStatusChange && undoTimeLeft > 0 && (
          <Box
            sx={{
              position: 'fixed',
              bottom: 20,
              right: 20,
              backgroundColor: 'success.main',
              color: 'white',
              p: 2,
              borderRadius: 2,
              boxShadow: 3,
              zIndex: 1300,
              minWidth: 300
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="body2">
                  Status updated successfully
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Press Ctrl+Z to undo
                </Typography>
              </Box>
              <Button
                size="small"
                onClick={handleUndo}
                sx={{ color: 'white', border: '1px solid white' }}
              >
                Undo ({undoTimeLeft}s)
              </Button>
            </Box>
          </Box>
        )}
      </motion.div>
    </Container>
  )
}

export default OrderManagement