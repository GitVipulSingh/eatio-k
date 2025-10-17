// client/src/store/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/apiService';

// --- Async Thunks for Authentication ---

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/register', userData);
      localStorage.setItem('userInfo', JSON.stringify(data));
      return data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (loginData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/login', loginData);
      localStorage.setItem('userInfo', JSON.stringify(data));
      return data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getMe = createAsyncThunk(
  'auth/getMe',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await api.get('/users/profile');
      localStorage.setItem('userInfo', JSON.stringify(data));
      return data;
    } catch (error) {
      dispatch(logoutUser()); // If getMe fails, trigger a full logout
      return rejectWithValue(error.response.data);
    }
  }
);

// --- THIS IS THE NEW LOGOUT THUNK ---
// It makes an API call to the server to destroy the session cookie.
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/auth/logout'); // Tell backend to clear the HttpOnly cookie
      localStorage.removeItem('userInfo'); // Clear client-side storage
      return; // Return on success
    } catch (error) {
      // Even if the API call fails, clear local data as a fallback
      localStorage.removeItem('userInfo');
      return rejectWithValue(error.response.data);
    }
  }
);
// --- END OF NEW THUNK ---

export const sendRegistrationOtp = createAsyncThunk( /* ... existing code ... */ );
export const forgotPassword = createAsyncThunk( /* ... existing code ... */ );
export const resetPassword = createAsyncThunk( /* ... existing code ... */ );


const initialState = {
  userInfo: localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null,
  isAuthenticated: !!localStorage.getItem('userInfo'),
  status: 'idle',
  error: null,
  message: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  // The synchronous logout reducer is removed as the async thunk now handles all logout logic.
  reducers: {
    clearMessages: (state) => {
      state.error = null;
      state.message = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Register, Login, getMe, password reset, etc. cases remain the same
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.userInfo = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.userInfo = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.userInfo = action.payload;
        state.isAuthenticated = true;
      })
      
      // --- ADD CASE FOR THE NEW LOGOUT THUNK ---
      .addCase(logoutUser.fulfilled, (state) => {
        state.userInfo = null;
        state.isAuthenticated = false;
        state.status = 'succeeded'; // Or 'idle'
        state.error = null;
        state.message = null;
      })
      // --- END OF NEW CASE ---

      // Generic matchers for pending and rejected states can simplify the code
      .addMatcher(
        (action) => action.type.endsWith('/pending'),
        (state) => {
          state.status = 'loading';
          state.error = null;
          state.message = null;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/rejected'),
        (state, action) => {
          state.status = 'failed';
          state.error = action.payload?.message;
        }
      );
  },
});

// Note: The synchronous 'logout' is no longer exported from reducers.
export const { clearMessages } = authSlice.actions;
export default authSlice.reducer;