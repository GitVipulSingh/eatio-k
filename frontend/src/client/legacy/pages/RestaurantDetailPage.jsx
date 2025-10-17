// client/src/pages/RestaurantDetailPage.jsx

import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRestaurantById } from '../store/slices/restaurantSlice';
import { addToCart } from '../store/slices/cartSlice';
import toast from 'react-hot-toast'; // <-- Import toast for better notifications

const RestaurantDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { selectedRestaurant: restaurant, status, error } = useSelector(
    (state) => state.restaurants
  );

  useEffect(() => {
    // Only fetch if there's no restaurant or the wrong one is selected
    if (!restaurant || restaurant._id !== id) {
      dispatch(fetchRestaurantById(id));
    }
  }, [id, dispatch, restaurant]);

  // --- THIS IS THE FIX ---
  const addToCartHandler = (menuItem) => {
    // Create a new object that includes all menuItem properties (...)
    // AND adds the parent restaurant's ID.
    const itemToAdd = {
      ...menuItem,
      restaurant: restaurant._id, // Attach the restaurant ID
    };
    dispatch(addToCart(itemToAdd));
    // Use a toast notification instead of an alert for better UX
    toast.success(`${menuItem.name} added to cart!`);
  };
  // --- END OF FIX ---

  if (status === 'loading') {
    return <p className="text-center mt-8">Loading restaurant...</p>;
  }
  if (status === 'failed') {
    return <p className="text-center mt-8 text-red-500">Error: {error}</p>;
  }
  if (!restaurant) {
    return <p className="text-center mt-8">Restaurant not found.</p>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="border-b pb-4 mb-8">
        <h1 className="text-4xl font-bold">{restaurant.name}</h1>
        <p className="text-gray-600 mt-2">{restaurant.cuisine.join(', ')}</p>
        <p className="text-gray-500">{`${restaurant.address.street}, ${restaurant.address.city}`}</p>
      </div>

      <div>
        <h2 className="text-3xl font-bold mb-6">Menu</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {restaurant.menuItems.map((item) => (
            <div key={item._id} className="flex bg-white p-4 rounded-lg shadow-md border">
              <div className="flex-grow pr-4">
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                <p className="text-lg font-bold mt-2">₹{item.price}</p>
                {item.isAvailable ? (
                  <button 
                    onClick={() => addToCartHandler(item)}
                    className="mt-4 bg-orange-100 text-orange-600 border border-orange-300 px-4 py-2 rounded-lg hover:bg-orange-200 text-sm font-semibold"
                  >
                    Add to Cart
                  </button>
                ) : (
                  <p className="mt-4 text-sm font-semibold text-red-500">Currently Unavailable</p>
                )}
              </div>
              <div className="flex-shrink-0 w-32 h-32 relative">
                <img 
                  src={item.image || 'https://placehold.co/200x200/eee/ccc?text=Item'} 
                  alt={item.name}
                  className={`w-full h-full object-cover rounded-md ${!item.isAvailable ? 'filter grayscale' : ''}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetailPage;