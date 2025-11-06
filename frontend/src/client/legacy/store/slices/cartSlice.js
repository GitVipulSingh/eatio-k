// client/src/store/slices/cartSlice.js
import { createSlice } from '@reduxjs/toolkit';

// Helper function to update localStorage and state
const updateCart = (state) => {
  // Calculate items price based on quantity
  state.itemsPrice = state.cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  state.shippingPrice = state.itemsPrice > 500 ? 0 : 50;
  state.taxPrice = 0.05 * state.itemsPrice;

  state.totalPrice = Math.round((state.itemsPrice + state.shippingPrice + state.taxPrice) * 100) / 100;

  localStorage.setItem('cart', JSON.stringify(state));
  return state; // Ensure the updated state is returned
};

const initialState = localStorage.getItem('cart')
  ? JSON.parse(localStorage.getItem('cart'))
  : {
    cartItems: [],
    itemsPrice: 0,
    shippingPrice: 0,
    taxPrice: 0,
    totalPrice: 0,
  };

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const newItem = action.payload; // Now contains the restaurant ID
      const existItem = state.cartItems.find((x) => x._id === newItem._id);

      // This logic now works correctly because newItem.restaurant is defined
      if (state.cartItems.length > 0 && state.cartItems[0].restaurant !== newItem.restaurant) {
        // Clear the cart if the new item is from a different restaurant
        state.cartItems = [];
      }

      if (existItem) {
        // If item already exists, increment its quantity
        state.cartItems = state.cartItems.map((x) =>
          x._id === existItem._id ? { ...x, quantity: x.quantity + 1 } : x
        );
      } else {
        // Otherwise, add the new item with a quantity of 1
        state.cartItems = [...state.cartItems, { ...newItem, quantity: 1 }];
      }

      updateCart(state);
    },
    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter((x) => x._id !== action.payload);
      updateCart(state);
    },
    adjustQuantity: (state, action) => {
      const { _id, quantity } = action.payload;
      state.cartItems = state.cartItems.map(item =>
        item._id === _id ? { ...item, quantity: quantity } : item
      );
      updateCart(state);
    },
    clearCart: (state) => {
      state.cartItems = [];
      updateCart(state);
    },
  },
});

export const { addToCart, removeFromCart, adjustQuantity, clearCart } = cartSlice.actions;

export default cartSlice.reducer;
