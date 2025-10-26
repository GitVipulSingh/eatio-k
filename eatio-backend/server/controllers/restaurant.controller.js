// server/controllers/restaurant.controller.js

const Restaurant = require('../models/restaurant.model');
const { deleteFromCloudinary, getPublicIdFromUrl } = require('../config/cloudinary');
const path = require('path');

const getAllRestaurants = async (req, res) => { 
    try {
        const restaurants = await Restaurant.find({ status: 'approved' });
        res.status(200).json(restaurants);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching restaurants.' });
    }
};

const getRestaurantById = async (req, res) => { 
    try {
        const restaurant = await Restaurant.findById(req.params.id);
        if (restaurant) {
            res.status(200).json(restaurant);
        } else {
            res.status(404).json({ message: 'Restaurant not found.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching restaurant details.' });
    }
};

const addMenuItem = async (req, res) => { 
    try {
        console.log(`➕ [ADD_MENU] Adding menu item with data:`, req.body);
        const { name, description, price, category, image } = req.body;
        console.log(`➕ [ADD_MENU] Image URL received: ${image}`);
        
        const restaurant = await Restaurant.findById(req.user.restaurant);

        if (!restaurant) {
            console.log(`❌ [ADD_MENU] Restaurant not found for user:`, req.user.restaurant);
            return res.status(404).json({ message: 'Restaurant not found.' });
        }
        
        const newMenuItem = { name, description, price, category, image };
        console.log(`➕ [ADD_MENU] Creating menu item:`, newMenuItem);
        
        // Use findByIdAndUpdate to add menu item without full validation
        await Restaurant.findByIdAndUpdate(
          req.user.restaurant,
          { $push: { menuItems: newMenuItem } },
          { runValidators: false }
        );
        
        console.log(`✅ [ADD_MENU] Menu item added successfully. Total items: ${restaurant.menuItems.length}`);
        res.status(201).json(restaurant);
    } catch (error) {
        console.error(`❌ [ADD_MENU] Error adding menu item:`, error);
        res.status(500).json({ message: 'Server error while adding menu item.' });
    }
};

const getMyRestaurant = async (req, res) => {
  try {
    console.log(`🏪 [GET_RESTAURANT] Fetching restaurant for user:`, req.user.restaurant);
    const restaurant = await Restaurant.findById(req.user.restaurant);
    if (restaurant) {
      console.log(`🏪 [GET_RESTAURANT] Restaurant found: ${restaurant.name}`);
      console.log(`🏪 [GET_RESTAURANT] Menu items count: ${restaurant.menuItems.length}`);
      
      // Log image URLs for debugging
      restaurant.menuItems.forEach((item, index) => {
        console.log(`🏪 [GET_RESTAURANT] Item ${index}: ${item.name}, Image: ${item.image}`);
      });
      
      res.json(restaurant);
    } else {
      console.log(`❌ [GET_RESTAURANT] Restaurant not found for user:`, req.user.restaurant);
      res.status(404).json({ message: 'Restaurant not found for this admin.' });
    }
  } catch (error) {
    console.error(`❌ [GET_RESTAURANT] Error fetching restaurant:`, error);
    res.status(500).json({ message: 'Server error fetching restaurant.' });
  }
};

// --- UPDATED FUNCTION WITH LOCAL STORAGE SUPPORT ---
const updateMenuItem = async (req, res) => {
  try {
    console.log(`🔄 [UPDATE_MENU] Starting menu item update for ID: ${req.params.menuItemId}`);
    console.log(`🔄 [UPDATE_MENU] Update data:`, req.body);
    
    const { menuItemId } = req.params;
    const updateData = req.body;

    const restaurant = await Restaurant.findById(req.user.restaurant);
    if (!restaurant) {
      console.log(`❌ [UPDATE_MENU] Restaurant not found for user: ${req.user.restaurant}`);
      return res.status(404).json({ message: 'Restaurant not found.' });
    }

    const menuItem = restaurant.menuItems.id(menuItemId);
    if (!menuItem) {
      console.log(`❌ [UPDATE_MENU] Menu item not found: ${menuItemId}`);
      return res.status(404).json({ message: 'Menu item not found.' });
    }

    console.log(`🔄 [UPDATE_MENU] Current menu item:`, {
      name: menuItem.name,
      currentImage: menuItem.image,
      newImage: updateData.image
    });

    // Handle image deletion if a new image is being set
    if (updateData.image && menuItem.image && updateData.image !== menuItem.image) {
      console.log(`🗑️ [UPDATE_MENU] Image change detected, checking old image for deletion`);
      
      // Check if old image is a Cloudinary URL
      if (menuItem.image.includes('cloudinary.com')) {
        console.log(`🗑️ [UPDATE_MENU] Old image is Cloudinary URL: ${menuItem.image}`);
        
        try {
          // Cloudinary file - delete from Cloudinary
          const oldPublicId = getPublicIdFromUrl(menuItem.image);
          console.log(`🗑️ [UPDATE_MENU] Extracted public ID: ${oldPublicId}`);
          
          if (oldPublicId) {
            const deleteResult = await deleteFromCloudinary(oldPublicId);
            console.log(`🗑️ [UPDATE_MENU] Cloudinary deletion result:`, deleteResult);
          } else {
            console.log(`⚠️ [UPDATE_MENU] Could not extract public ID from URL: ${menuItem.image}`);
          }
        } catch (deleteError) {
          console.error(`❌ [UPDATE_MENU] Error deleting old image from Cloudinary:`, deleteError);
          // Don't fail the update if image deletion fails
          console.log(`⚠️ [UPDATE_MENU] Continuing with update despite image deletion failure`);
        }
      } else {
        console.log(`ℹ️ [UPDATE_MENU] Old image is not a Cloudinary URL: ${menuItem.image}`);
      }
    } else {
      console.log(`ℹ️ [UPDATE_MENU] No image change detected or no existing image`);
    }

    // Apply all updates from the request body to the menu item
    console.log(`🔄 [UPDATE_MENU] Applying updates to menu item`);
    
    // Remove menuItemId from updateData if it exists (it should only be in params)
    const { menuItemId: _, ...cleanUpdateData } = updateData;
    console.log(`🔄 [UPDATE_MENU] Clean update data:`, cleanUpdateData);
    
    // Validate and sanitize the update data
    const validatedData = {};
    if (cleanUpdateData.name !== undefined) validatedData.name = String(cleanUpdateData.name);
    if (cleanUpdateData.description !== undefined) validatedData.description = String(cleanUpdateData.description);
    if (cleanUpdateData.price !== undefined) validatedData.price = Number(cleanUpdateData.price);
    if (cleanUpdateData.category !== undefined) validatedData.category = String(cleanUpdateData.category);
    if (cleanUpdateData.image !== undefined) validatedData.image = String(cleanUpdateData.image);
    if (cleanUpdateData.isAvailable !== undefined) validatedData.isAvailable = Boolean(cleanUpdateData.isAvailable);
    
    console.log(`🔄 [UPDATE_MENU] Validated data:`, validatedData);
    
    // Apply updates individually to avoid any issues with the set method
    Object.keys(validatedData).forEach(key => {
      menuItem[key] = validatedData[key];
      console.log(`🔄 [UPDATE_MENU] Set ${key} = ${validatedData[key]}`);
    });
    
    console.log(`💾 [UPDATE_MENU] Saving restaurant with updated menu item`);
    
    // Use findByIdAndUpdate to update specific menu item without full validation
    await Restaurant.findOneAndUpdate(
      { 
        _id: req.user.restaurant,
        'menuItems._id': menuItemId 
      },
      {
        $set: {
          'menuItems.$.name': validatedData.name,
          'menuItems.$.description': validatedData.description,
          'menuItems.$.price': validatedData.price,
          'menuItems.$.category': validatedData.category,
          'menuItems.$.image': validatedData.image,
          'menuItems.$.isAvailable': validatedData.isAvailable
        }
      },
      { runValidators: false }
    );
    
    console.log(`✅ [UPDATE_MENU] Menu item updated successfully: ${menuItem.name}`);
    res.json({ 
      message: 'Menu item updated successfully.',
      menuItem: menuItem
    });

  } catch (error) {
    console.error("❌ [UPDATE_MENU] Update Menu Item Error:", error);
    console.error("❌ [UPDATE_MENU] Error stack:", error.stack);
    res.status(500).json({ message: 'Server error updating menu item.' });
  }
};
// --- END OF UPDATED FUNCTION ---

const deleteMenuItem = async (req, res) => { 
    try {
        const { menuItemId } = req.params;
        const restaurant = await Restaurant.findById(req.user.restaurant);
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found.' });
        }
        
        // Before deleting the item from our DB, delete its image
        const menuItem = restaurant.menuItems.id(menuItemId);
        if (menuItem && menuItem.image) {
            // Check if it's a Cloudinary URL
            if (menuItem.image.includes('cloudinary.com')) {
                // Cloudinary file - delete from Cloudinary
                const publicId = getPublicIdFromUrl(menuItem.image);
                if (publicId) {
                    await deleteFromCloudinary(publicId);
                }
            }
            // Note: Legacy local files are no longer supported for deletion since we've migrated to Cloudinary
        }

        // Use findByIdAndUpdate to remove menu item without full validation
        await Restaurant.findByIdAndUpdate(
          req.user.restaurant,
          { $pull: { menuItems: { _id: menuItemId } } },
          { runValidators: false }
        );
        res.json({ message: 'Menu item removed successfully.' });
    } catch (error) {
        console.error("Delete Menu Item Error:", error);
        res.status(500).json({ message: 'Server error deleting menu item.' });
    }
};

module.exports = {
  getAllRestaurants,
  getRestaurantById,
  addMenuItem,
  getMyRestaurant,
  updateMenuItem,
  deleteMenuItem,
};
