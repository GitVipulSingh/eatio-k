import { createSlice } from '@reduxjs/toolkit'

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
    
    calculateTotals: (state) => {
      const subtotal = state.items.reduce((total, item) => total + item.totalPrice, 0)
      const tax = subtotal * state.taxRate
      state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0)
      state.totalAmount = subtotal + tax + (subtotal > 0 ? state.deliveryFee : 0)
    },
  },
})

export const { addToCart, removeFromCart, updateQuantity, clearCart, calculateTotals } = cartSlice.actions
export default cartSlice.reducer