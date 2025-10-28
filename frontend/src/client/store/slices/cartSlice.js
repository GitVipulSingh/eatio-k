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

const initialState = {
  items: [],
  totalAmount: 0,
  totalItems: 0,
  restaurantId: null,
  deliveryFee: 30,
  taxRate: 0.18, // 18% GST
}

// Load cart from localStorage
const savedCart = localStorage.getItem('eatio-cart')
if (savedCart) {
  try {
    const parsed = JSON.parse(savedCart)
    Object.assign(initialState, parsed)
  } catch (error) {
    localStorage.removeItem('eatio-cart')
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
        existingItem.totalPrice = existingItem.quantity * existingItem.price
      } else {
        state.items.push({
          ...item,
          quantity: quantityToAdd,
          totalPrice: item.price * quantityToAdd
        })
      }
      
      cartSlice.caseReducers.calculateTotals(state)
      localStorage.setItem('eatio-cart', JSON.stringify(state))
    },
    
    removeFromCart: (state, action) => {
      const itemId = action.payload
      state.items = state.items.filter(item => item._id !== itemId)
      
      if (state.items.length === 0) {
        state.restaurantId = null
      }
      
      cartSlice.caseReducers.calculateTotals(state)
      localStorage.setItem('eatio-cart', JSON.stringify(state))
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
          item.totalPrice = item.quantity * item.price
        }
      }
      
      if (state.items.length === 0) {
        state.restaurantId = null
      }
      
      cartSlice.caseReducers.calculateTotals(state)
      localStorage.setItem('eatio-cart', JSON.stringify(state))
    },
    
    clearCart: (state) => {
      state.items = []
      state.totalAmount = 0
      state.totalItems = 0
      state.restaurantId = null
      localStorage.removeItem('eatio-cart')
    },

    // Clear cart when user logs out (called from auth slice)
    clearCartOnLogout: (state) => {
      state.items = []
      state.totalAmount = 0
      state.totalItems = 0
      state.restaurantId = null
      localStorage.removeItem('eatio-cart')
    },
    
    calculateTotals: (state) => {
      const subtotal = state.items.reduce((total, item) => total + item.totalPrice, 0)
      const tax = subtotal * state.taxRate
      state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0)
      state.totalAmount = subtotal + tax + (subtotal > 0 ? state.deliveryFee : 0)
    },
  },
})

export const { addToCart, removeFromCart, updateQuantity, clearCart, clearCartOnLogout, calculateTotals } = cartSlice.actions
export default cartSlice.reducer