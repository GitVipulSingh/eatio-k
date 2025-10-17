// client/src/components/RestaurantCard.jsx

import React from 'react';
import { Link } from 'react-router-dom';

const RestaurantCard = ({ restaurant }) => {
  return (
    <Link to={`/restaurants/${restaurant._id}`} className="block">
      <div className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
        <img
          src={restaurant.imageUrl || `https://placehold.co/600x400/orange/white?text=${restaurant.name}`}
          alt={restaurant.name}
          className="w-full h-48 object-cover"
        />
        <div className="p-4">
          <h3 className="text-xl font-bold mb-2">{restaurant.name}</h3>
          <p className="text-gray-600 mb-2">{restaurant.cuisine.join(', ')}</p>
          <div className="flex items-center mb-2">
            <span className="bg-green-500 text-white text-sm font-semibold px-2 py-1 rounded">
              {restaurant.averageRating || '4.2'} ★
            </span>
            <p className="text-gray-500 ml-2">{restaurant.address.city}</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;
