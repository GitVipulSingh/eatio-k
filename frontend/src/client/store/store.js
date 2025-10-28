import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import cartReducer, { clearCartOnLogout } from './slices/cartSlice'
import uiReducer from './slices/uiSlice'

// Middleware to clear cart when user logs out
const cartClearMiddleware = (store) => (next) => (action) => {
  const result = next(action)
  
  // Clear cart when user logs out
  if (action.type === 'auth/logout') {
    store.dispatch(clearCartOnLogout())
  }
  
  return result
}

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }).concat(cartClearMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
})