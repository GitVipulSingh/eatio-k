// client/src/pages/CheckoutPage.jsx
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../api/apiService';
import { clearCart } from '../store/slices/cartSlice';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userInfo } = useSelector((state) => state.auth);
  const { cartItems, totalPrice } = useSelector((state) => state.cart);
  
  const [address, setAddress] = useState({
    street: '123 Main St',
    city: 'Delhi',
    pincode: '110001',
  });

  const handlePayment = async () => {
    // --- THIS IS THE FIX ---
    // 1. Add validation to check for the restaurant ID before proceeding.
    if (cartItems.length === 0 || !cartItems[0].restaurant) {
      toast.error('Your cart is invalid. Please remove all items and add them again.');
      return;
    }
    // --- END OF FIX ---

    try {
      const { data: razorpayOrder } = await api.post('/payment/create-order', { amount: totalPrice });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'eatio',
        description: 'Food Order Payment',
        order_id: razorpayOrder.id,
        handler: async function (response) {
          try {
            const paymentData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderItems: cartItems.map(item => ({ name: item.name, price: item.price, quantity: item.quantity })),
              restaurantId: cartItems[0].restaurant, // This will now be valid
              deliveryAddress: address,
              totalAmount: totalPrice,
            };

            const { data: verificationResponse } = await api.post('/payment/verify-payment', paymentData);
            
            if (verificationResponse.order && verificationResponse.order._id) {
              const newOrderId = verificationResponse.order._id;
              dispatch(clearCart());
              toast.success('Payment successful! Your order has been placed.');
              navigate(`/orders/${newOrderId}`);
            } else {
              toast.error('Payment verified, but failed to create order. Please contact support.');
            }

          } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to verify payment.';
            console.error('Verification Error:', errorMessage);
            toast.error(errorMessage);
          }
        },
        prefill: {
          name: userInfo.name,
          email: userInfo.email,
          contact: userInfo.phone,
        },
        theme: {
          color: '#F97316',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Payment failed.';
      console.error('Payment Initialization Error:', errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold border-b pb-2 mb-4">Shipping Address</h2>
        <div className="space-y-4">
          <p><strong>Street:</strong> {address.street}</p>
          <p><strong>City:</strong> {address.city}</p>
          <p><strong>Pincode:</strong> {address.pincode}</p>
        </div>
        
        <h2 className="text-2xl font-bold border-b pb-2 mb-4 mt-8">Order Summary</h2>
        <div className="space-y-2">
          {cartItems.map(item => (
            <div key={item._id} className="flex justify-between">
              <span>{item.name} x {item.quantity}</span>
              <span>₹{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <p className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
            <span>Total to Pay:</span>
            <span>₹{totalPrice.toFixed(2)}</span>
          </p>
        </div>

        <button
          onClick={handlePayment}
          disabled={cartItems.length === 0}
          className="w-full bg-orange-500 text-white py-3 rounded-lg mt-8 text-lg font-bold hover:bg-orange-600 disabled:bg-gray-400"
        >
          Pay with Razorpay
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;