import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
}

// Get user from localStorage if available
const userInfo = localStorage.getItem('userInfo')
if (userInfo) {
  try {
    const parsed = JSON.parse(userInfo)
    initialState.user = parsed.user || parsed
    initialState.isAuthenticated = true
  } catch (error) {
    localStorage.removeItem('userInfo')
  }
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    loginSuccess: (state, action) => {
      state.user = action.payload.user
      state.isAuthenticated = true
      state.loading = false
      localStorage.setItem('userInfo', JSON.stringify(action.payload))
    },
    logout: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.loading = false
      localStorage.removeItem('userInfo')
    },
    updateProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload }
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
      userInfo.user = state.user
      localStorage.setItem('userInfo', JSON.stringify(userInfo))
    },
  },
})

export const { setLoading, loginSuccess, logout, updateProfile } = authSlice.actions
export default authSlice.reducer