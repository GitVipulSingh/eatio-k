// client/src/store/store.js

import { configureStore } from '@reduxjs/toolkit';

import authReducer from './slices/authSlice';
import restaurantReducer from './slices/restaurantSlice';
import cartReducer from './slices/cartSlice'; // <-- Import the new cart reducer

export const store = configureStore({
  reducer: {
    auth: authReducer,
    restaurants: restaurantReducer,
    cart: cartReducer, // <-- Add the cart reducer to the store
  },
  devTools: process.env.NODE_ENV !== 'production',
});
