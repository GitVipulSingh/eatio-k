// client/src/api/apiService.js

import axios from 'axios';

// Create a centralized Axios instance that will be used throughout the app.
const api = axios.create({
  // Use your environment variable for the base URL
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  // This line is critical: it tells Axios to send cookies with every request.
  withCredentials: true, 
});

export default api;