// server/controllers/search.controller.js

const Restaurant = require('../models/restaurant.model');

// @desc    Search for restaurants by text and/or location
// @route   GET /api/search
// @access  Public
const searchRestaurants = async (req, res) => {
  try {
    const { q, lat, lon, cuisine, minRating } = req.query;

    if (!q && !lat && !lon) {
      return res.status(400).json({ message: 'Search query or location is required' });
    }

    let matchConditions = {};
    let pipeline = [];

    // Base match conditions
    matchConditions.status = 'approved'; // Only show approved restaurants

    // --- Enhanced Text Search ---
    if (q) {
      const searchRegex = new RegExp(q, 'i'); // Case-insensitive regex
      
      matchConditions.$or = [
        { name: searchRegex },
        { cuisine: { $in: [searchRegex] } },
        { 'address.city': searchRegex },
        { 'address.area': searchRegex },
        { 'menuItems.name': searchRegex },
        { 'menuItems.description': searchRegex },
        { 'menuItems.category': searchRegex }
      ];
    }

    // Filter by cuisine if provided
    if (cuisine) {
      matchConditions.cuisine = { $in: [new RegExp(cuisine, 'i')] };
    }

    // Filter by minimum rating if provided
    if (minRating) {
      matchConditions.rating = { $gte: parseFloat(minRating) };
    }

    // --- Stage 1: Geospatial Search (if location is provided) ---
    if (lat && lon) {
      pipeline.push({
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [parseFloat(lon), parseFloat(lat)],
          },
          distanceField: 'distance',
          maxDistance: 10000, // 10km radius
          spherical: true,
          query: matchConditions // Apply match conditions to geospatial search
        },
      });
    } else {
      // If no geospatial search, use regular match
      pipeline.push({ $match: matchConditions });
    }

    // --- Stage 2: Add search relevance score ---
    if (q) {
      pipeline.push({
        $addFields: {
          searchScore: {
            $add: [
              // Name match gets highest score
              { $cond: [{ $regexMatch: { input: '$name', regex: q, options: 'i' } }, 10, 0] },
              // Cuisine match gets medium score
              { $cond: [{ $in: [new RegExp(q, 'i'), '$cuisine'] }, 5, 0] },
              // Menu item match gets lower score
              { $cond: [{ $anyElementTrue: { $map: { input: '$menuItems', as: 'item', in: { $regexMatch: { input: '$$item.name', regex: q, options: 'i' } } } } }, 3, 0] }
            ]
          }
        }
      });
    }

    // --- Stage 3: Sorting ---
    let sortStage = {};
    if (q) {
      sortStage.searchScore = -1; // Higher score first
    }
    if (lat && lon) {
      sortStage.distance = 1; // Closer restaurants first
    }
    sortStage.rating = -1; // Higher rated restaurants first
    sortStage.name = 1; // Alphabetical as final sort

    pipeline.push({ $sort: sortStage });

    // --- Stage 4: Limit results ---
    pipeline.push({ $limit: 50 });

    // --- Stage 5: Project only needed fields ---
    pipeline.push({
      $project: {
        name: 1,
        cuisine: 1,
        rating: 1,
        address: 1,
        image: 1,
        deliveryTime: 1,
        deliveryFee: 1,
        minOrder: 1,
        isOpen: 1,
        distance: 1,
        searchScore: 1,
        menuItems: {
          $filter: {
            input: '$menuItems',
            as: 'item',
            cond: q ? { $regexMatch: { input: '$$item.name', regex: q, options: 'i' } } : true
          }
        }
      }
    });

    // Execute the aggregation pipeline
    const restaurants = await Restaurant.aggregate(pipeline);

    // Format response
    const response = {
      restaurants,
      total: restaurants.length,
      query: q,
      filters: {
        cuisine,
        minRating,
        location: lat && lon ? { lat: parseFloat(lat), lon: parseFloat(lon) } : null
      }
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Server error during search.' });
  }
};

module.exports = { searchRestaurants };
