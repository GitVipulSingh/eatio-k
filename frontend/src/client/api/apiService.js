import axios from 'axios'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // Important for cookie-based auth
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for logging and error handling
api.interceptors.request.use(
  (config) => {
    // Log API calls in development
    if (import.meta.env.DEV) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`)
    }
    return config
  },
  (error) => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for handling errors and logging
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data)
    }
    return response
  },
  (error) => {
    // Log errors in development
    if (import.meta.env.DEV) {
      console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response?.data)
    }

    // Handle different error scenarios
    if (error.response?.status === 401) {
      // Clear user data on unauthorized access
      localStorage.removeItem('userInfo')
      
      // Only redirect if not already on auth pages (login, register, etc.)
      if (!window.location.pathname.includes('/auth/')) {
        console.log('🔒 Unauthorized access, redirecting to login')
        // Use React Router navigation instead of window.location for SPA
        window.location.href = '/auth/login'
      }
    } else if (error.response?.status === 403) {
      // Handle forbidden access
      console.warn('Access forbidden - insufficient permissions')
    } else if (error.response?.status >= 500) {
      // Handle server errors
      console.error('Server error occurred')
    } else if (error.code === 'ECONNABORTED') {
      // Handle timeout errors
      console.error('Request timeout')
    } else if (!error.response) {
      // Handle network errors
      console.error('Network error - please check your connection')
    }

    return Promise.reject(error)
  }
)

export default api