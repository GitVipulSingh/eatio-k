import { createSlice } from '@reduxjs/toolkit'

// Helper function to check if user is authenticated
const isUserAuthenticated = () => {
  const userInfo = localStorage.getItem('userInfo')
  if (!userInfo) return false
  
  try {
    const parsed = JSON.parse(userInfo)
    return !!(parsed.user || parsed)
  } catch {
    return false
  }
}

// Helper function to get current user ID
const getCurrentUserId = () => {
  const userInfo = localStorage.getItem('userInfo')
  if (!userInfo) return null
  
  try {
    const parsed = JSON.parse(userInfo)
    return parsed.user?._id || parsed._id || null
  } catch {
    return null
  }
}

// Helper function to get user-specific cart key
const getUserCartKey = (userId) => {
  return userId ? `eatio-cart-${userId}` : 'eatio-cart'
}

// Helper function to load user-specific cart
const loadUserCartFromStorage = (userId) => {
  if (!userId) return null
  
  const cartKey = getUserCartKey(userId)
  const savedCart = localStorage.getItem(cartKey)
  
  if (savedCart) {
    try {
      return JSON.parse(savedCart)
    } catch (error) {
      localStorage.removeItem(cartKey)
    }
  }
  return null
}

// Helper function to save user-specific cart
const saveUserCart = (userId, cartState) => {
  if (!userId) return
  
  const cartKey = getUserCartKey(userId)
  localStorage.setItem(cartKey, JSON.stringify(cartState))
}

const initialState = {
  items: [],
  totalAmount: 0,
  totalItems: 0,
  restaurantId: null,
  deliveryFee: 30,
  taxRate: 0.18, // 18% GST
}

// Load user-specific cart from localStorage if user is authenticated
const currentUserId = getCurrentUserId()
if (currentUserId) {
  const userCart = loadUserCartFromStorage(currentUserId)
  if (userCart) {
    Object.assign(initialState, userCart)
  }
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      // Prevent adding to cart if user is not authenticated
      if (!isUserAuthenticated()) {
        console.warn('Cannot add to cart: User not authenticated')
        return state
      }

      const { item, restaurantId } = action.payload
      const quantityToAdd = item.quantity || 1
      
      // If cart has items from different restaurant, clear cart
      if (state.restaurantId && state.restaurantId !== restaurantId) {
        state.items = []
        state.totalAmount = 0
        state.totalItems = 0
      }
      
      state.restaurantId = restaurantId
      
      const existingItem = state.items.find(cartItem => cartItem._id === item._id)
      
      if (existingItem) {
        existingItem.quantity += quantityToAdd
        existingItem.totalPrice = Math.round(existingItem.quantity * existingItem.price * 100) / 100
      } else {
        state.items.push({
          ...item,
          quantity: quantityToAdd,
          totalPrice: Math.round(item.price * quantityToAdd * 100) / 100
        })
      }
      
      cartSlice.caseReducers.calculateTotals(state)
      
      // Save to user-specific cart
      const userId = getCurrentUserId()
      if (userId) {
        saveUserCart(userId, state)
      }
    },
    
    removeFromCart: (state, action) => {
      const itemId = action.payload
      state.items = state.items.filter(item => item._id !== itemId)
      
      if (state.items.length === 0) {
        state.restaurantId = null
      }
      
      cartSlice.caseReducers.calculateTotals(state)
      
      // Save to user-specific cart
      const userId = getCurrentUserId()
      if (userId) {
        saveUserCart(userId, state)
      }
    },
    
    updateQuantity: (state, action) => {
      // Prevent updating cart if user is not authenticated
      if (!isUserAuthenticated()) {
        console.warn('Cannot update cart: User not authenticated')
        return state
      }

      const { itemId, quantity } = action.payload
      const item = state.items.find(item => item._id === itemId)
      
      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter(item => item._id !== itemId)
        } else {
          item.quantity = quantity
          item.totalPrice = Math.round(item.quantity * item.price * 100) / 100
        }
      }
      
      if (state.items.length === 0) {
        state.restaurantId = null
      }
      
      cartSlice.caseReducers.calculateTotals(state)
      
      // Save to user-specific cart
      const userId = getCurrentUserId()
      if (userId) {
        saveUserCart(userId, state)
      }
    },
    
    clearCart: (state) => {
      state.items = []
      state.totalAmount = 0
      state.totalItems = 0
      state.restaurantId = null
      
      // Clear user-specific cart
      const userId = getCurrentUserId()
      if (userId) {
        const cartKey = getUserCartKey(userId)
        localStorage.removeItem(cartKey)
      }
    },

    // Load user cart when user logs in
    loadUserCart: (state, action) => {
      const userId = action.payload
      if (userId) {
        const userCart = loadUserCartFromStorage(userId)
        if (userCart) {
          state.items = userCart.items || []
          state.totalAmount = userCart.totalAmount || 0
          state.totalItems = userCart.totalItems || 0
          state.restaurantId = userCart.restaurantId || null
          state.deliveryFee = userCart.deliveryFee || 30
          state.taxRate = userCart.taxRate || 0.18
        }
      }
    },

    // Clear cart when user logs out (called from auth slice)
    clearCartOnLogout: (state) => {
      // Don't remove from localStorage on logout - keep user's cart for next login
      state.items = []
      state.totalAmount = 0
      state.totalItems = 0
      state.restaurantId = null
    },
    
    calculateTotals: (state) => {
      const subtotal = state.items.reduce((total, item) => total + item.totalPrice, 0)
      const tax = subtotal * state.taxRate
      state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0)
      state.totalAmount = Math.round((subtotal + tax + (subtotal > 0 ? state.deliveryFee : 0)) * 100) / 100
    },
  },
})

export const { addToCart, removeFromCart, updateQuantity, clearCart, loadUserCart, clearCartOnLogout, calculateTotals } = cartSlice.actions
export default cartSlice.reducer