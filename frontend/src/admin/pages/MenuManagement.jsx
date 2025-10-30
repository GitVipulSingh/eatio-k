import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Alert,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  FormControlLabel,
} from '@mui/material'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PhotoIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'

import { 
  useMyRestaurant, 
  useAddMenuItem, 
  useUpdateMenuItem, 
  useDeleteMenuItem,
  useUploadMenuImage,
  useDeleteMenuImage
} from '../../client/api/queries'
import { getMenuItemImageUrl } from '../../common/utils/imageUtils'
import LoadingSpinner from '../../common/components/LoadingSpinner'

const MenuManagement = () => {
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'table'

  const { data: restaurant, isLoading, refetch } = useMyRestaurant()
  const addMenuItemMutation = useAddMenuItem()
  const updateMenuItemMutation = useUpdateMenuItem()
  const deleteMenuItemMutation = useDeleteMenuItem()
  const uploadImageMutation = useUploadMenuImage()
  const deleteImageMutation = useDeleteMenuImage()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm()

  const categories = [
    'Appetizers', 'Main Course', 'Desserts', 'Beverages', 'Snacks',
    'Breakfast', 'Lunch', 'Dinner', 'Specials', 'Combos'
  ]

  const handleAddItem = async (data) => {
    try {
      console.log(`➕ [MENU_MGMT] Starting add item process with data:`, data);
      setUploadingImage(true)
      let imageUrl = ''

      // Upload image if selected
      if (selectedFile) {
        console.log(`➕ [MENU_MGMT] Uploading selected file:`, {
          name: selectedFile.name,
          size: selectedFile.size,
          type: selectedFile.type
        });
        const uploadResult = await uploadImageMutation.mutateAsync(selectedFile)
        imageUrl = uploadResult.imageUrl
        console.log(`➕ [MENU_MGMT] Upload result:`, uploadResult);
        console.log(`➕ [MENU_MGMT] Image URL from upload: ${imageUrl}`);
      } else {
        console.log(`➕ [MENU_MGMT] No file selected for upload`);
      }

      const menuItemData = {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        category: data.category,
        image: imageUrl,
        isAvailable: data.isAvailable !== false,
      }

      console.log(`➕ [MENU_MGMT] Final menu item data to be sent:`, menuItemData);
      await addMenuItemMutation.mutateAsync(menuItemData)
      console.log(`✅ [MENU_MGMT] Menu item added successfully`);
      toast.success('Menu item added successfully!')
      setAddDialogOpen(false)
      reset()
      setImagePreview(null)
      setSelectedFile(null)
      refetch()
    } catch (error) {
      console.error(`❌ [MENU_MGMT] Error adding menu item:`, error);
      toast.error(error.response?.data?.message || 'Failed to add menu item')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleEditItem = async (data) => {
    try {
      console.log('Editing item with data:', data)
      console.log('Selected item:', selectedItem)
      console.log('Selected file:', selectedFile)
      
      setUploadingImage(true)
      let imageUrl = selectedItem.image || ''

      // Upload new image if selected
      if (selectedFile) {
        console.log('Uploading new image...')
        
        // Upload new image (backend will handle old image deletion)
        const uploadResult = await uploadImageMutation.mutateAsync(selectedFile)
        imageUrl = uploadResult.imageUrl
        console.log('New image uploaded:', imageUrl)
      }

      const menuItemData = {
        menuItemId: selectedItem._id,
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        category: data.category,
        image: imageUrl,
        isAvailable: data.isAvailable !== false,
      }

      console.log('Updating menu item with data:', menuItemData)
      await updateMenuItemMutation.mutateAsync(menuItemData)
      toast.success('Menu item updated successfully!')
      setEditDialogOpen(false)
      reset()
      setImagePreview(null)
      setSelectedFile(null)
      setSelectedItem(null)
      refetch()
    } catch (error) {
      console.error('Error updating menu item:', error)
      toast.error(error.response?.data?.message || 'Failed to update menu item')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleDeleteItem = async () => {
    try {
      console.log('Deleting item:', selectedItem)
      await deleteMenuItemMutation.mutateAsync(selectedItem._id)
      toast.success('Menu item deleted successfully!')
      setDeleteDialogOpen(false)
      setSelectedItem(null)
      refetch()
    } catch (error) {
      console.error('Error deleting menu item:', error)
      toast.error(error.response?.data?.message || 'Failed to delete menu item')
    }
  }

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB')
        return
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please select a valid image file (JPEG, PNG, GIF, WebP)')
        return
      }

      setSelectedFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const openEditDialog = (item) => {
    console.log('Opening edit dialog for item:', item)
    console.log('Item availability:', item.isAvailable)
    setSelectedItem(item)
    
    // Reset form first to clear any previous values
    reset()
    
    // Set form values with a small delay to ensure form is reset
    setTimeout(() => {
      setValue('name', item.name)
      setValue('description', item.description)
      setValue('price', item.price)
      setValue('category', item.category)
      setValue('isAvailable', item.isAvailable)
      console.log('Form values set, isAvailable:', item.isAvailable)
    }, 10)
    
    // Use the image utility function to get the correct URL for preview
    setImagePreview(item.image ? getMenuItemImageUrl(item.image, item.name, item.category, restaurant?.cuisine) : null)
    setSelectedFile(null) // Reset file selection
    setEditDialogOpen(true)
  }

  const openDeleteDialog = (item) => {
    console.log('Opening delete dialog for item:', item)
    setSelectedItem(item)
    setDeleteDialogOpen(true)
  }

  const resetForm = () => {
    reset()
    setImagePreview(null)
    setSelectedFile(null)
    setSelectedItem(null)
  }

  const handleCloseAddDialog = () => {
    setAddDialogOpen(false)
    resetForm()
  }

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false)
    resetForm()
  }

  if (isLoading) {
    return <LoadingSpinner message="Loading menu..." />
  }

  const menuItems = restaurant?.menuItems || []
  
  console.log('Restaurant data:', restaurant)
  console.log('Menu items:', menuItems)
  
  // Debug image URLs
  menuItems.forEach((item, index) => {
    if (item.image) {
      console.log(`Item ${index} (${item.name}) image URL:`, item.image)
      console.log(`Constructed URL:`, item.image.startsWith('http') ? item.image : `http://localhost:5000${item.image}`)
    }
  })

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
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
              Manage Your Menu
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Add, edit, and manage your restaurant's menu items
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={viewMode === 'table'}
                  onChange={(e) => setViewMode(e.target.checked ? 'table' : 'grid')}
                />
              }
              label="Table View"
            />
            <Button
              variant="contained"
              startIcon={<PlusIcon className="h-4 w-4" />}
              onClick={() => setAddDialogOpen(true)}
            >
              Add New Item
            </Button>
          </Box>
        </Box>

        {/* Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {menuItems.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Items
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                  {menuItems.filter(item => item.isAvailable).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Available
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'error.main' }}>
                  {menuItems.filter(item => !item.isAvailable).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Unavailable
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                  {new Set(menuItems.map(item => item.category)).size}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Categories
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Menu Items Display */}
        {menuItems.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 8 }}>
              <Box sx={{ fontSize: '4rem', mb: 2 }}>🍽️</Box>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                No menu items yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Start building your menu by adding your first item
              </Typography>
              <Button
                variant="contained"
                startIcon={<PlusIcon className="h-4 w-4" />}
                onClick={() => setAddDialogOpen(true)}
              >
                Add Your First Item
              </Button>
            </CardContent>
          </Card>
        ) : viewMode === 'grid' ? (
          <Grid container spacing={3}>
            {menuItems.map((item, index) => (
              <Grid item xs={12} sm={6} md={4} key={item._id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card sx={{ 
                    height: '100%', 
                    position: 'relative',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      boxShadow: 6,
                      transform: 'translateY(-4px)'
                    }
                  }}>
                    {item.image ? (
                      <Box sx={{ position: 'relative', height: 200, overflow: 'hidden' }}>
                        <CardMedia
                          component="img"
                          height="200"
                          image={(() => {
                            const imageUrl = getMenuItemImageUrl(item.image, item.name, item.category, restaurant?.cuisine)
                            console.log(`MenuManagement - Item: ${item.name}, Original image: ${item.image}, Generated URL: ${imageUrl}`)
                            return imageUrl
                          })()}
                          alt={item.name}
                          sx={{
                            objectFit: 'cover',
                            width: '100%',
                            height: '100%',
                            transition: 'transform 0.3s ease-in-out',
                            '&:hover': {
                              transform: 'scale(1.05)'
                            }
                          }}
                          onError={(e) => {
                            console.log(`MenuManagement - Image failed to load for ${item.name}:`, e.target.src)
                            console.log('Original item.image:', item.image)
                            e.target.parentElement.innerHTML = `
                              <div style="height: 200px; display: flex; align-items: center; justify-content: center; background-color: #f5f5f5; flex-direction: column;">
                                <div style="font-size: 3rem; margin-bottom: 8px;">🍽️</div>
                                <div style="color: #666; font-size: 14px;">Image not available</div>
                              </div>
                            `
                          }}
                          onLoad={() => {
                            console.log(`MenuManagement - Image loaded successfully for ${item.name}:`, item.image)
                          }}
                        />
                        {/* Image overlay for better text readability */}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            backgroundColor: 'rgba(0, 0, 0, 0.6)',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: 1,
                            fontSize: '0.75rem'
                          }}
                        >
                          📸
                        </Box>
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          height: 200,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'grey.100',
                          flexDirection: 'column',
                          gap: 1
                        }}
                      >
                        <PhotoIcon className="h-12 w-12 text-gray-400" />
                        <Typography variant="body2" color="text.secondary">
                          No image uploaded
                        </Typography>
                      </Box>
                    )}
                    
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {item.name}
                        </Typography>
                        <Chip
                          label={item.isAvailable ? 'Available' : 'Unavailable'}
                          color={item.isAvailable ? 'success' : 'error'}
                          size="small"
                        />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {item.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                          ₹{item.price}
                        </Typography>
                        <Chip label={item.category} variant="outlined" size="small" />
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<PencilIcon className="h-4 w-4" />}
                          onClick={() => {
                            console.log('Edit clicked for item:', item)
                            openEditDialog(item)
                          }}
                          color="primary"
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<TrashIcon className="h-4 w-4" />}
                          onClick={() => {
                            console.log('Delete clicked for item:', item)
                            openDeleteDialog(item)
                          }}
                          color="error"
                        >
                          Delete
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Image</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {menuItems.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>
                      {item.image ? (
                        <Avatar
                          src={getMenuItemImageUrl(item.image, item.name, item.category, restaurant?.cuisine)}
                          alt={item.name}
                          sx={{ 
                            width: 60, 
                            height: 60,
                            border: '2px solid #e0e0e0',
                            '&:hover': {
                              transform: 'scale(1.1)',
                              transition: 'transform 0.2s ease-in-out'
                            }
                          }}
                          onError={(e) => {
                            console.log('Table image failed to load:', item.image)
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjMwIiB5PSIzNSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk5OTk5OSI+8J+NvTwvdGV4dD4KPC9zdmc+'
                          }}
                        />
                      ) : (
                        <Avatar sx={{ width: 60, height: 60, backgroundColor: 'grey.200' }}>
                          <PhotoIcon className="h-6 w-6" />
                        </Avatar>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {item.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {item.description?.substring(0, 50)}...
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={item.category} variant="outlined" size="small" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        ₹{item.price}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={item.isAvailable ? 'Available' : 'Unavailable'}
                        color={item.isAvailable ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<PencilIcon className="h-4 w-4" />}
                          onClick={() => {
                            console.log('Edit clicked for item:', item)
                            openEditDialog(item)
                          }}
                          color="primary"
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<TrashIcon className="h-4 w-4" />}
                          onClick={() => {
                            console.log('Delete clicked for item:', item)
                            openDeleteDialog(item)
                          }}
                          color="error"
                        >
                          Delete
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Add Item Dialog */}
        <Dialog open={addDialogOpen} onClose={handleCloseAddDialog} maxWidth="md" fullWidth>
          <DialogTitle>Add New Menu Item</DialogTitle>
          <form onSubmit={handleSubmit(handleAddItem)}>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Item Name *"
                    {...register('name', { required: 'Item name is required' })}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Price (₹) *"
                    type="number"
                    inputProps={{ min: 0, step: 0.01 }}
                    {...register('price', { required: 'Price is required' })}
                    error={!!errors.price}
                    helperText={errors.price?.message}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={3}
                    {...register('description')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Category *</InputLabel>
                    <Select
                      {...register('category', { required: 'Category is required' })}
                      error={!!errors.category}
                      label="Category *"
                    >
                      {categories.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        {...register('isAvailable')}
                        defaultChecked
                      />
                    }
                    label="Available for order"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Item Image
                    </Typography>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="image-upload"
                      type="file"
                      onChange={handleImageUpload}
                    />
                    <label htmlFor="image-upload">
                      <Button variant="outlined" component="span" startIcon={<PhotoIcon className="h-4 w-4" />}>
                        Upload Image
                      </Button>
                    </label>
                  </Box>
                  {imagePreview && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                        Image Preview:
                      </Typography>
                      <Box
                        sx={{
                          position: 'relative',
                          display: 'inline-block',
                          border: '2px solid #e0e0e0',
                          borderRadius: 2,
                          overflow: 'hidden',
                          maxWidth: 200
                        }}
                      >
                        <img
                          src={imagePreview}
                          alt="Preview"
                          style={{ 
                            width: '100%', 
                            maxWidth: 200, 
                            height: 'auto', 
                            display: 'block'
                          }}
                        />
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            backgroundColor: 'rgba(76, 175, 80, 0.8)',
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: 1,
                            fontSize: '0.7rem',
                            fontWeight: 'bold'
                          }}
                        >
                          ✓ Ready
                        </Box>
                      </Box>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseAddDialog}>Cancel</Button>
              <Button
                type="submit"
                variant="contained"
                disabled={addMenuItemMutation.isPending || uploadingImage}
              >
                {(addMenuItemMutation.isPending || uploadingImage) ? (
                  <LoadingSpinner size={20} />
                ) : (
                  'Add Item'
                )}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Edit Item Dialog */}
        <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} maxWidth="md" fullWidth>
          <DialogTitle>Edit Menu Item</DialogTitle>
          <form onSubmit={handleSubmit(handleEditItem)}>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Item Name *"
                    {...register('name', { required: 'Item name is required' })}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Price (₹) *"
                    type="number"
                    inputProps={{ min: 0, step: 0.01 }}
                    {...register('price', { required: 'Price is required' })}
                    error={!!errors.price}
                    helperText={errors.price?.message}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={3}
                    {...register('description')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Category *</InputLabel>
                    <Select
                      {...register('category', { required: 'Category is required' })}
                      error={!!errors.category}
                      label="Category *"
                    >
                      {categories.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        {...register('isAvailable')}
                        checked={watch('isAvailable') ?? selectedItem?.isAvailable ?? true}
                        defaultChecked={selectedItem?.isAvailable ?? true}
                      />
                    }
                    label="Available for order"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Item Image
                    </Typography>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="edit-image-upload"
                      type="file"
                      onChange={handleImageUpload}
                    />
                    <label htmlFor="edit-image-upload">
                      <Button variant="outlined" component="span" startIcon={<PhotoIcon className="h-4 w-4" />}>
                        Change Image
                      </Button>
                    </label>
                  </Box>
                  {imagePreview && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                        {selectedFile ? 'New Image Preview:' : 'Current Image:'}
                      </Typography>
                      <Box
                        sx={{
                          position: 'relative',
                          display: 'inline-block',
                          border: '2px solid #e0e0e0',
                          borderRadius: 2,
                          overflow: 'hidden',
                          maxWidth: 200
                        }}
                      >
                        <img
                          src={imagePreview}
                          alt="Preview"
                          style={{ 
                            width: '100%', 
                            maxWidth: 200, 
                            height: 'auto', 
                            display: 'block'
                          }}
                        />
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            backgroundColor: selectedFile ? 'rgba(76, 175, 80, 0.8)' : 'rgba(33, 150, 243, 0.8)',
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: 1,
                            fontSize: '0.7rem',
                            fontWeight: 'bold'
                          }}
                        >
                          {selectedFile ? '✓ New' : '📷 Current'}
                        </Box>
                      </Box>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseEditDialog}>Cancel</Button>
              <Button
                type="submit"
                variant="contained"
                disabled={updateMenuItemMutation.isPending || uploadingImage}
              >
                {(updateMenuItemMutation.isPending || uploadingImage) ? (
                  <LoadingSpinner size={20} />
                ) : (
                  'Update Item'
                )}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Delete Menu Item</DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              Are you sure you want to delete "{selectedItem?.name}"? This action cannot be undone.
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDeleteItem}
              disabled={deleteMenuItemMutation.isPending}
            >
              {deleteMenuItemMutation.isPending ? <LoadingSpinner size={20} /> : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      </motion.div>
    </Container>
  )
}

export default MenuManagement