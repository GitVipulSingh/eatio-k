// client/src/pages/OrderDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import api from '../api/apiService';
import OrderTracker from './components/OrderTracker'; // <-- Import the new visual tracker

const OrderDetailPage = () => {
  const { id: orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- FIX: Refactored useEffect for stable WebSocket connection ---
  useEffect(() => {
    // 1. Fetch the initial order details when the component loads
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${orderId}`);
        setOrder(data);
      } catch (error) {
        console.error("Failed to fetch order details", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();

    // 2. Establish the WebSocket connection
    // We connect with withCredentials to ensure our auth cookies are sent
    const socket = io('http://localhost:5000', {
      withCredentials: true,
    });

    // 3. Join the specific "room" for this order to receive targeted updates
    socket.emit('join_order_room', orderId);

    // 4. Set up the listener for real-time status updates
    socket.on('order_status_updated', (updatedOrder) => {
      console.log('✅ Order status updated via WebSocket:', updatedOrder);
      // Update the page's state with the new data pushed from the server
      setOrder(updatedOrder);
    });

    // 5. Clean up the connection when the component is unmounted (very important)
    return () => {
      console.log('❌ Disconnecting WebSocket...');
      socket.disconnect();
    };
  }, [orderId]); // This effect runs only when the orderId changes

  if (loading) return <div className="text-center p-8">Loading order details...</div>;
  if (!order) return <div className="text-center p-8">Order not found.</div>;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold">Order Details</h1>
            <p className="text-sm text-gray-500">Order ID: {order._id}</p>
          </div>
          <div className="text-right">
             <p className="text-lg font-semibold">Total Amount</p>
             <p className="text-2xl font-bold text-orange-600">₹{order.totalAmount.toFixed(2)}</p>
          </div>
        </div>
        <div className="mt-4">
            <p><strong>Restaurant:</strong> {order.restaurant?.name}</p>
            <p><strong>Deliver to:</strong> {`${order.deliveryAddress.street}, ${order.deliveryAddress.city}`}</p>
        </div>
      </div>

      {/* --- FIX: Replaced the basic progress bar with our new component --- */}
      <OrderTracker status={order.status} />

      <div className="bg-white p-6 rounded-lg shadow-md mt-8">
        <h2 className="text-xl font-bold mb-4 border-b pb-2">Order Summary</h2>
        <div className="space-y-2">
            {order.items.map((item, index) => (
            <div key={index} className="flex justify-between">
                <span>{item.name} x {item.quantity}</span>
                <span>₹{(item.price * item.quantity).toFixed(2)}</span>
            </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;