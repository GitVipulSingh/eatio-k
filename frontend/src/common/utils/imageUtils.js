// Common utility functions for handling images across the platform

/**
 * Get the correct URL for a menu item image
 * @param {string} imageUrl - The image URL from the database
 * @param {string} itemName - Menu item name (fallback)
 * @param {string} category - Menu item category (fallback)
 * @param {string[]} cuisine - Restaurant cuisine (fallback)
 * @returns {string} - The correct image URL to display
 */
export const getMenuItemImageUrl = (imageUrl, itemName = '', category = '', cuisine = []) => {
  console.log(`🖼️  [IMAGE_UTILS] Processing image for item: "${itemName}"`);
  console.log(`🖼️  [IMAGE_UTILS] Input imageUrl: "${imageUrl}"`);
  console.log(`🖼️  [IMAGE_UTILS] Environment VITE_API_URL: "${import.meta.env.VITE_API_URL}"`);
  
  // If we have an uploaded image, use it
  if (imageUrl) {
    console.log(`🖼️  [IMAGE_UTILS] Image URL exists, processing...`);
    
    // If it's already a full URL (http/https), return as is
    if (imageUrl.startsWith('http')) {
      console.log(`🖼️  [IMAGE_UTILS] Full URL detected, returning as-is: ${imageUrl}`);
      return imageUrl
    }
    
    // If it's a local path starting with /api/uploads/, construct the full URL
    if (imageUrl.startsWith('/api/uploads/')) {
      const envUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const baseUrl = envUrl.replace('/api', '');
      const fullUrl = `${baseUrl}${imageUrl}`;
      
      console.log(`🖼️  [IMAGE_UTILS] Local path detected:`);
      console.log(`🖼️  [IMAGE_UTILS] - Original env URL: ${envUrl}`);
      console.log(`🖼️  [IMAGE_UTILS] - Base URL after removing /api: ${baseUrl}`);
      console.log(`🖼️  [IMAGE_UTILS] - Image path: ${imageUrl}`);
      console.log(`🖼️  [IMAGE_UTILS] - Final constructed URL: ${fullUrl}`);
      
      return fullUrl;
    }
    
    // If it's just a filename, construct the full path
    const envUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const baseUrl = envUrl.replace('/api', '');
    const fullUrl = `${baseUrl}/api/uploads/menu_images/${imageUrl}`;
    
    console.log(`🖼️  [IMAGE_UTILS] Filename detected:`);
    console.log(`🖼️  [IMAGE_UTILS] - Original env URL: ${envUrl}`);
    console.log(`🖼️  [IMAGE_UTILS] - Base URL after removing /api: ${baseUrl}`);
    console.log(`🖼️  [IMAGE_UTILS] - Filename: ${imageUrl}`);
    console.log(`🖼️  [IMAGE_UTILS] - Final constructed URL: ${fullUrl}`);
    
    return fullUrl;
  }
  
  // Fallback to generated image if no uploaded image
  console.log(`🖼️  [IMAGE_UTILS] No uploaded image, using fallback for: ${itemName}`);
  const fallbackUrl = getMenuItemImage(itemName, category, cuisine);
  console.log(`🖼️  [IMAGE_UTILS] Fallback URL: ${fallbackUrl}`);
  return fallbackUrl;
}

/**
 * Get a fallback image for menu items based on name, category, and cuisine
 * This is the existing function from foodImages.js
 */
export const getMenuItemImage = (itemName, category, cuisine) => {
  const itemNameLower = itemName?.toLowerCase() || ''
  const categoryLower = category?.toLowerCase() || ''
  const primaryCuisine = Array.isArray(cuisine) ? cuisine[0] : cuisine || 'Indian'

  // Specific item name matches
  const itemImageMap = {
    // Indian dishes
    'biryani': 'https://images.unsplash.com/photo-1563379091339-03246963d96c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'butter chicken': 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'dal': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'naan': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'tandoori': 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'curry': 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'samosa': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'dosa': 'https://images.unsplash.com/photo-1630383249896-424e482df921?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'idli': 'https://images.unsplash.com/photo-1630383249896-424e482df921?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    
    // Chinese dishes
    'fried rice': 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'noodles': 'https://images.unsplash.com/photo-1555126634-323283e090fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'manchurian': 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'spring roll': 'https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    
    // Italian dishes
    'pizza': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'pasta': 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'lasagna': 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'risotto': 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    
    // American dishes
    'burger': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'sandwich': 'https://images.unsplash.com/photo-1553909489-cd47e0ef937f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'fries': 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'hot dog': 'https://images.unsplash.com/photo-1612392062798-2dd3c8d2b9b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    
    // Mexican dishes
    'taco': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'burrito': 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'quesadilla': 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'nachos': 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    
    // Thai dishes
    'pad thai': 'https://images.unsplash.com/photo-1559314809-0f31657def5e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'tom yum': 'https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'green curry': 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    
    // Japanese dishes
    'sushi': 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'ramen': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'tempura': 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    
    // Desserts
    'ice cream': 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'cake': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'pastry': 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'cookie': 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    
    // Beverages
    'coffee': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'tea': 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'juice': 'https://images.unsplash.com/photo-1613478223719-2ab802602423?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'smoothie': 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  }

  // Check for specific item name matches
  for (const [key, image] of Object.entries(itemImageMap)) {
    if (itemNameLower.includes(key)) {
      return image
    }
  }

  // Category-based images
  const categoryImageMap = {
    'appetizers': 'https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'starters': 'https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'main course': 'https://images.unsplash.com/photo-1563379091339-03246963d96c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'mains': 'https://images.unsplash.com/photo-1563379091339-03246963d96c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'desserts': 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'beverages': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'drinks': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'snacks': 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'breakfast': 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'lunch': 'https://images.unsplash.com/photo-1563379091339-03246963d96c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'dinner': 'https://images.unsplash.com/photo-1563379091339-03246963d96c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'specials': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'combos': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  }

  if (categoryImageMap[categoryLower]) {
    return categoryImageMap[categoryLower]
  }

  // Cuisine-based fallback images
  const cuisineImageMap = {
    'Indian': 'https://images.unsplash.com/photo-1563379091339-03246963d96c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'Chinese': 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'Italian': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'Mexican': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'American': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'Thai': 'https://images.unsplash.com/photo-1559314809-0f31657def5e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'Japanese': 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'Mediterranean': 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  }

  return cuisineImageMap[primaryCuisine] || cuisineImageMap['Indian']
}