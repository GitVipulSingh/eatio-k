// client/src/components/Header.jsx
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { NavLink, Link, useNavigate } from 'react-router-dom';
// --- THIS IS THE FIX ---
// Import the new async thunk for logging out
import { logoutUser } from '../store/slices/authSlice';
// --- END OF FIX ---
import { clearCart } from '../store/slices/cartSlice';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);

  const totalCartItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // --- THIS IS THE FIX ---
  // The logout handler is now an async function
  const handleLogout = async () => {
    try {
      // Dispatch the async thunk to perform a full-stack logout
      await dispatch(logoutUser()).unwrap();
      // These actions will run only after the logout is successful
      dispatch(clearCart());
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
      // Even if logout fails, force a redirect to the login page
      navigate('/login');
    }
  };
  // --- END OF FIX ---

  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-orange-500">
          eatio
        </Link>
        <nav className="flex items-center gap-6">
          {userInfo ? (
            <>
              <NavLink to="/order-history" className="text-gray-600 hover:text-orange-500">
                My Orders
              </NavLink>
              <NavLink to="/profile" className="text-gray-600 hover:text-orange-500">
                Profile ({userInfo.name.split(' ')[0]})
              </NavLink>
              <button onClick={handleLogout} className="text-gray-600 hover:text-orange-500">
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="text-gray-600 hover:text-orange-500">
                Login
              </NavLink>
              <NavLink 
                to="/register" 
                className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600"
              >
                Register
              </NavLink>
            </>
          )}
          <Link to="/cart" className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" className="text-gray-600 hover:text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {totalCartItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {totalCartItems}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;