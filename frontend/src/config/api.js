// Centralized API configuration for the entire application
// Single frontend deployment with route-based user access

// Get base API URL from environment variables with robust fallback
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get socket URL (remove /api suffix if present) with robust fallback
export const SOCKET_URL = (() => {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl) {
    return apiUrl.replace('/api', '');
  }
  return 'http://localhost:5000';
})();

// Get client URL (single frontend deployment)
export const CLIENT_URL = import.meta.env.VITE_CLIENT_URL || 
  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

// Payment configuration
export const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

// Debug configuration
export const DEBUG_MODE = import.meta.env.VITE_DEBUG_MODE === 'true' || import.meta.env.DEV;
export const LOG_LEVEL = import.meta.env.VITE_LOG_LEVEL || 'info';

// Helper function to construct full image URLs
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  const baseUrl = SOCKET_URL;
  return `${baseUrl}${imagePath}`;
};

// Helper function to log API calls in development
export const logApiCall = (method, url, data = null) => {
  if (DEBUG_MODE) {
    console.log(`🚀 API ${method.toUpperCase()}: ${url}`, data ? { data } : '');
  }
};

// Validate configuration on import (development only)
if (DEBUG_MODE && typeof window !== 'undefined') {
  console.log('🔧 API Configuration:', {
    API_BASE_URL,
    SOCKET_URL,
    CLIENT_URL,
    RAZORPAY_KEY_ID: RAZORPAY_KEY_ID ? '✅ Set' : '❌ Missing',
    DEBUG_MODE,
    LOG_LEVEL
  });
}

export default {
  API_BASE_URL,
  SOCKET_URL,
  CLIENT_URL,
  RAZORPAY_KEY_ID,
  DEBUG_MODE,
  LOG_LEVEL,
  getImageUrl,
  logApiCall
};