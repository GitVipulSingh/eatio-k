import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
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
    Alert,
    Tabs,
    Tab,
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
} from '@mui/material'
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    EyeIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
} from '@heroicons/react/24/outline'

import { useMyRestaurant, useRestaurantOrders } from '../api/queries'
import LoadingSpinner from '../components/ui/LoadingSpinner'
// Socket.IO imports
import { useSocket } from '../../contexts/SocketContext'
import { useRealTimeUpdates } from '../../hooks/useRealTimeUpdates'

const RestaurantDashboard = () => {
    const { user } = useSelector(state => state.auth)
    const [selectedTab, setSelectedTab] = useState(0)
    const [menuItemDialog, setMenuItemDialog] = useState(false)
    const [selectedMenuItem, setSelectedMenuItem] = useState(null)

    const { data: restaurant, isLoading: restaurantLoading } = useMyRestaurant()
    const { data: orders, isLoading: ordersLoading } = useRestaurantOrders()
    const { joinRestaurantRoom, leaveRestaurantRoom } = useSocket()

    // Get restaurant ID from user data
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    const currentUser = userInfo.user || {}
    const restaurantId = currentUser.restaurant

    // Enable real-time updates for restaurant orders
    useRealTimeUpdates({
        enableOrderUpdates: true,
        restaurantId: restaurantId
    })

    // Join restaurant room for real-time updates
    useEffect(() => {
        if (restaurantId) {
            joinRestaurantRoom(restaurantId)

            // Cleanup: leave room when component unmounts
            return () => {
                leaveRestaurantRoom(restaurantId)
            }
        }
    }, [restaurantId, joinRestaurantRoom, leaveRestaurantRoom])

    if (restaurantLoading) {
        return <LoadingSpinner message="Loading restaurant dashboard..." fullScreen />
    }

    if (!restaurant) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error">
                    Restaurant not found. Please contact support.
                </Alert>
            </Container>
        )
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'success'
            case 'pending_approval': return 'warning'
            case 'rejected': return 'error'
            default: return 'default'
        }
    }

    const getStatusText = (status) => {
        switch (status) {
            case 'approved': return 'Approved'
            case 'pending_approval': return 'Pending Approval'
            case 'rejected': return 'Rejected'
            default: return status
        }
    }

    const handleTabChange = (event, newValue) => {
        setSelectedTab(newValue)
    }

    const handleAddMenuItem = () => {
        setSelectedMenuItem(null)
        setMenuItemDialog(true)
    }

    const handleEditMenuItem = (item) => {
        setSelectedMenuItem(item)
        setMenuItemDialog(true)
    }

    const renderOverview = () => (
        <Grid container spacing={3}>
            {/* Restaurant Status */}
            <Grid item xs={12}>
                <Card>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                {restaurant.name}
                            </Typography>
                            <Chip
                                label={getStatusText(restaurant.status)}
                                color={getStatusColor(restaurant.status)}
                                variant="filled"
                            />
                        </Box>

                        {restaurant.status === 'pending_approval' && (
                            <Alert severity="info" sx={{ mb: 2 }}>
                                <Typography variant="body2">
                                    Your restaurant is under review. You'll be notified once it's approved.
                                    This usually takes 24-48 hours.
                                </Typography>
                            </Alert>
                        )}

                        {restaurant.status === 'rejected' && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                <Typography variant="body2">
                                    Your restaurant application was rejected. Please contact support for more information.
                                </Typography>
                            </Alert>
                        )}

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">Address</Typography>
                                <Typography variant="body1">
                                    {restaurant.address?.street}, {restaurant.address?.city} - {restaurant.address?.pincode}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">Cuisines</Typography>
                                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                                    {restaurant.cuisine?.map((cuisine) => (
                                        <Chip key={cuisine} label={cuisine} size="small" variant="outlined" />
                                    ))}
                                </Box>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Grid>

            {/* Stats Cards */}
            <Grid item xs={12} sm={6} md={3}>
                <Card>
                    <CardContent>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                            {restaurant.menuItems?.length || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Menu Items
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
                <Card>
                    <CardContent>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                            {orders?.filter(order => order.status === 'Delivered')?.length || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Completed Orders
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
                <Card>
                    <CardContent>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                            {orders?.filter(order => ['Pending', 'Confirmed', 'Preparing'].includes(order.status))?.length || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Active Orders
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
                <Card>
                    <CardContent>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                            {restaurant.averageRating?.toFixed(1) || '0.0'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Average Rating
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    )

    const renderMenu = () => (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Menu Management
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<PlusIcon className="h-4 w-4" />}
                    onClick={handleAddMenuItem}
                    disabled={restaurant.status !== 'approved'}
                    size="small"
                    sx={{ minWidth: 'auto' }}
                >
                    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Add Menu Item</Box>
                    <Box sx={{ display: { xs: 'block', sm: 'none' } }}>Add Item</Box>
                </Button>
            </Box>

            {restaurant.status !== 'approved' && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                    Menu management is only available for approved restaurants.
                </Alert>
            )}

            {/* Mobile Card View */}
            <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                {restaurant.menuItems?.map((item) => (
                    <Card key={item._id} sx={{ mb: 2 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                                        {item.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        {item.description}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                        <Chip label={item.category} size="small" variant="outlined" />
                                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                            ₹{item.price}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
                                    {item.isAvailable ? (
                                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                    ) : (
                                        <XCircleIcon className="h-5 w-5 text-red-500" />
                                    )}
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                <Button
                                    size="small"
                                    startIcon={<PencilIcon className="h-4 w-4" />}
                                    onClick={() => handleEditMenuItem(item)}
                                    disabled={restaurant.status !== 'approved'}
                                >
                                    Edit
                                </Button>
                                <Button
                                    size="small"
                                    color="error"
                                    startIcon={<TrashIcon className="h-4 w-4" />}
                                    disabled={restaurant.status !== 'approved'}
                                >
                                    Delete
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                ))}
            </Box>

            {/* Desktop Table View */}
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell>Price</TableCell>
                                <TableCell>Available</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {restaurant.menuItems?.map((item) => (
                                <TableRow key={item._id}>
                                    <TableCell>
                                        <Box>
                                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                {item.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {item.description}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={item.category} size="small" variant="outlined" />
                                    </TableCell>
                                    <TableCell>₹{item.price}</TableCell>
                                    <TableCell>
                                        {item.isAvailable ? (
                                            <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                        ) : (
                                            <XCircleIcon className="h-5 w-5 text-red-500" />
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleEditMenuItem(item)}
                                            disabled={restaurant.status !== 'approved'}
                                        >
                                            <PencilIcon className="h-4 w-4" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            color="error"
                                            disabled={restaurant.status !== 'approved'}
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            {(!restaurant.menuItems || restaurant.menuItems.length === 0) && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                        No menu items yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Add your first menu item to get started
                    </Typography>
                </Box>
            )}
        </Box>
    )

    const renderOrders = () => (
        <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                Orders Management
            </Typography>

            {ordersLoading ? (
                <LoadingSpinner />
            ) : (
                <>
                    {/* Mobile Card View */}
                    <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                        {orders?.map((order) => (
                            <Card key={order._id} sx={{ mb: 2 }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                                                #{order._id.slice(-6)}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                {order.user?.name}
                                            </Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main', mb: 1 }}>
                                                ₹{order.totalAmount.toFixed(2)}
                                            </Typography>
                                        </Box>
                                        <Chip
                                            label={order.status}
                                            size="small"
                                            color={
                                                order.status === 'Delivered' ? 'success' :
                                                    order.status === 'Cancelled' ? 'error' :
                                                        'warning'
                                            }
                                        />
                                    </Box>
                                    
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                            Items:
                                        </Typography>
                                        <Typography variant="body2" sx={{ 
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                        }}>
                                            {order.items?.map(item => `${item.quantity}x ${item.name}`).join(', ')}
                                        </Typography>
                                    </Box>
                                    
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="caption" color="text.secondary">
                                            {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Typography>
                                        <Button
                                            size="small"
                                            startIcon={<EyeIcon className="h-4 w-4" />}
                                        >
                                            View
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>

                    {/* Desktop Table View */}
                    <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Order ID</TableCell>
                                        <TableCell>Customer</TableCell>
                                        <TableCell>Items</TableCell>
                                        <TableCell>Amount</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Time</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {orders?.map((order) => (
                                        <TableRow key={order._id}>
                                            <TableCell>#{order._id.slice(-6)}</TableCell>
                                            <TableCell>{order.user?.name}</TableCell>
                                            <TableCell>
                                                <Box sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {order.items?.map(item => `${item.quantity}x ${item.name}`).join(', ')}
                                                </Box>
                                            </TableCell>
                                            <TableCell>₹{order.totalAmount.toFixed(2)}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={order.status}
                                                    size="small"
                                                    color={
                                                        order.status === 'Delivered' ? 'success' :
                                                            order.status === 'Cancelled' ? 'error' :
                                                                'warning'
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Box>
                                                    <Typography variant="body2">
                                                        {new Date(order.createdAt).toLocaleDateString()}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <IconButton size="small">
                                                    <EyeIcon className="h-4 w-4" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                </>
            )}

            {(!orders || orders.length === 0) && !ordersLoading && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                        No orders yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Orders will appear here once customers start ordering
                    </Typography>
                </Box>
            )}
        </Box>
    )

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
                        Restaurant Dashboard
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage your restaurant, menu, and orders
                    </Typography>
                </Box>

                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs value={selectedTab} onChange={handleTabChange}>
                        <Tab label="Overview" />
                        <Tab label="Menu" />
                        <Tab label="Orders" />
                    </Tabs>
                </Box>

                {selectedTab === 0 && renderOverview()}
                {selectedTab === 1 && renderMenu()}
                {selectedTab === 2 && renderOrders()}

                {/* Menu Item Dialog */}
                <Dialog
                    open={menuItemDialog}
                    onClose={() => setMenuItemDialog(false)}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>
                        {selectedMenuItem ? 'Edit Menu Item' : 'Add Menu Item'}
                    </DialogTitle>
                    <DialogContent>
                        <Box sx={{ pt: 2 }}>
                            <TextField
                                fullWidth
                                label="Item Name"
                                defaultValue={selectedMenuItem?.name}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                label="Description"
                                multiline
                                rows={3}
                                defaultValue={selectedMenuItem?.description}
                                sx={{ mb: 2 }}
                            />
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Price"
                                        type="number"
                                        defaultValue={selectedMenuItem?.price}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Category</InputLabel>
                                        <Select
                                            defaultValue={selectedMenuItem?.category || ''}
                                            label="Category"
                                        >
                                            <MenuItem value="Appetizer">Appetizer</MenuItem>
                                            <MenuItem value="Main Course">Main Course</MenuItem>
                                            <MenuItem value="Dessert">Dessert</MenuItem>
                                            <MenuItem value="Beverage">Beverage</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setMenuItemDialog(false)}>
                            Cancel
                        </Button>
                        <Button variant="contained">
                            {selectedMenuItem ? 'Update' : 'Add'} Item
                        </Button>
                    </DialogActions>
                </Dialog>
            </motion.div>
        </Container>
    )
}

export default RestaurantDashboard