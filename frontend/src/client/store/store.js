import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import cartReducer, { clearCartOnLogout, loadUserCart } from './slices/cartSlice'
import uiReducer from './slices/uiSlice'

// Middleware to handle cart operations on auth changes
const cartSyncMiddleware = (store) => (next) => (action) => {
  const result = next(action)
  
  // Load user's cart when they log in
  if (action.type === 'auth/loginSuccess') {
    const userId = action.payload?.user?._id
    if (userId) {
      store.dispatch(loadUserCart(userId))
    }
  }
  
  // Clear local cart state when user logs out (but preserve in localStorage)
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
    }).concat(cartSyncMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
})