// client/src/pages/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, clearMessages } from '../store/slices/authSlice';
import { unwrapResult } from '@reduxjs/toolkit'; // <-- Import unwrapResult for cleaner async logic

const LoginPage = () => {
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.auth);

  useEffect(() => {
    // Clear any previous error messages when the component loads
    dispatch(clearMessages());
  }, [dispatch]);

  // --- THIS IS THE FIX: A more robust async handler ---
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Dispatch the login action and wait for it to complete
      const resultAction = await dispatch(loginUser({ loginIdentifier, password }));
      // unwrapResult will either return the successful payload or throw the error
      const user = unwrapResult(resultAction);

      // Use centralized role-based redirect system (all within same app)
      switch (user.role) {
        case 'admin':
        case 'superadmin':
          // Navigate to admin sections within the same app
          navigate(user.role === 'admin' ? '/admin/dashboard' : '/super-admin/dashboard');
          break;
        
        case 'customer':
        default:
          // For customers, use React Router's navigate for a smooth, single-page app transition
          navigate('/');
          break;
      }
    } catch (err) {
      // If unwrapResult throws an error, it means the login failed.
      // The error is already set in the Redux state by the rejected case,
      // so we just log it for debugging purposes.
      console.error('Login failed:', err);
    }
  };
  // --- END OF FIX ---

  return (
    <div className="container mx-auto max-w-sm px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-6">Login to Your Account</h1>
      
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label htmlFor="loginIdentifier">Email or Phone Number</label>
          <input 
            type="text" 
            id="loginIdentifier" 
            value={loginIdentifier} 
            onChange={(e) => setLoginIdentifier(e.target.value)} 
            className="w-full px-3 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500" 
            required 
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input 
            type="password" 
            id="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className="w-full px-3 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500" 
            required 
          />
        </div>
        <div className="text-right">
          <Link to="/forgot-password" className="text-sm text-orange-500 hover:underline">
            Forgot Password?
          </Link>
        </div>
        <button 
          type="submit" 
          className="w-full bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:bg-gray-400" 
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'Logging in...' : 'Login'}
        </button>
      </form>

      {error && <p className="text-red-500 text-center mt-4">{error}</p>}
      
      <p className="text-center text-gray-600 mt-6">
        Don't have an account?{' '}
        <Link to="/register" className="text-orange-500 font-semibold hover:underline">
          Sign Up
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;