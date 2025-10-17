// client/src/pages/CartPage.jsx

import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { adjustQuantity, removeFromCart } from '../store/slices/cartSlice';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cartItems, itemsPrice, shippingPrice, taxPrice, totalPrice } = useSelector(
    (state) => state.cart
  );
  const { isAuthenticated } = useSelector((state) => state.auth); // Check if user is logged in

  const handleQuantityChange = (item, quantity) => {
    dispatch(adjustQuantity({ ...item, quantity }));
  };

  const handleRemoveItem = (id) => {
    dispatch(removeFromCart(id));
  };
  
  const handleCheckout = () => {
    // A user must be logged in to proceed to checkout
    if (isAuthenticated) {
      navigate('/checkout');
    } else {
      navigate('/login?redirect=checkout'); // Redirect to login, then to checkout
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>
      {cartItems.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-xl text-gray-500">Your cart is empty.</p>
          <Link to="/" className="text-orange-500 font-semibold hover:underline mt-4 inline-block">
            ← Back to Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="md:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item._id} className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm">
                <div className="flex items-center">
                  <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-md mr-4" />
                  <div>
                    <Link to={`/restaurants/${item.restaurant}`} className="text-lg font-semibold hover:underline">{item.name}</Link>
                    <p className="text-gray-600">₹{item.price}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <select
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(item, Number(e.target.value))}
                    className="border rounded-md p-1"
                  >
                    {[...Array(10).keys()].map((x) => (
                      <option key={x + 1} value={x + 1}>{x + 1}</option>
                    ))}
                  </select>
                  <button onClick={() => handleRemoveItem(item._id)} className="text-red-500 hover:text-red-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="border rounded-lg p-6 h-fit bg-white shadow-sm">
            <h2 className="text-2xl font-bold border-b pb-2 mb-4">Order Summary</h2>
            <div className="space-y-2">
              <p className="flex justify-between"><span>Items:</span> <span>₹{itemsPrice.toFixed(2)}</span></p>
              <p className="flex justify-between"><span>Shipping:</span> <span>₹{shippingPrice.toFixed(2)}</span></p>
              <p className="flex justify-between"><span>Tax (5%):</span> <span>₹{taxPrice.toFixed(2)}</span></p>
              <p className="flex justify-between font-bold text-lg border-t pt-2 mt-2"><span>Total:</span> <span>₹{totalPrice.toFixed(2)}</span></p>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-green-500 text-white py-2 rounded-lg mt-6 hover:bg-green-600 transition-colors"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
