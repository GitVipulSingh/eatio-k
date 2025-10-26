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
        
        restaurant.menuItems.push(newMenuItem);
        await restaurant.save();
        
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
    const { menuItemId } = req.params;
    const updateData = req.body;

    const restaurant = await Restaurant.findById(req.user.restaurant);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found.' });
    }

    const menuItem = restaurant.menuItems.id(menuItemId);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found.' });
    }

    // Handle image deletion if a new image is being set
    if (updateData.image && menuItem.image && updateData.image !== menuItem.image) {
      // Check if old image is a Cloudinary URL
      if (menuItem.image.includes('cloudinary.com')) {
        // Cloudinary file - delete from Cloudinary
        const oldPublicId = getPublicIdFromUrl(menuItem.image);
        if (oldPublicId) {
          await deleteFromCloudinary(oldPublicId);
        }
      }
      // Note: Legacy local files are no longer supported for deletion since we've migrated to Cloudinary
    }

    // Apply all updates from the request body to the menu item
    menuItem.set(updateData);
    
    await restaurant.save();
    res.json({ 
      message: 'Menu item updated successfully.',
      menuItem: menuItem
    });

  } catch (error) {
    console.error("Update Menu Item Error:", error);
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

        restaurant.menuItems.pull({ _id: menuItemId });
        await restaurant.save();
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
