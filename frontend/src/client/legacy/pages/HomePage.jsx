// client/src/pages/HomePage.jsx

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRestaurants } from '../store/slices/restaurantSlice';
import RestaurantCard from '../components/RestaurantCard';

const HomePage = () => {
  const dispatch = useDispatch();

  // Get the restaurant data from the Redux store
  const { restaurants, status, error } = useSelector((state) => state.restaurants);

  // Fetch the restaurants when the component first loads
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchRestaurants());
    }
  }, [status, dispatch]);

  let content;

  if (status === 'loading') {
    content = <p>Loading restaurants...</p>;
  } else if (status === 'succeeded') {
    content = (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {restaurants.map((restaurant) => (
          <RestaurantCard key={restaurant._id} restaurant={restaurant} />
        ))}
      </div>
    );
  } else if (status === 'failed') {
    content = <p>Error: {error}</p>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Restaurants Near You</h1>
      {content}
    </div>
  );
};

export default HomePage;
