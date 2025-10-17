// client/src/pages/OrderHistoryPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/apiService';

const OrderHistoryPage = () => {
  const [activeOrders, setActiveOrders] = useState([]);
  const [pastOrders, setPastOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders/history');
        // Separate orders into active (trackable) and past (completed/cancelled)
        const active = data.filter(order => !['Delivered', 'Cancelled'].includes(order.status));
        const past = data.filter(order => ['Delivered', 'Cancelled'].includes(order.status));
        setActiveOrders(active);
        setPastOrders(past);
      } catch (error) {
        console.error('Failed to fetch order history', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return <p className="text-center mt-8">Loading your order history...</p>;
  }

  // A reusable component to render order cards, now more robust
  const OrderCard = ({ order }) => (
    <div className="bg-white p-4 rounded-lg shadow-md border flex justify-between items-center">
      <div>
        {/* Add a check to prevent crash if restaurant is not populated */}
        <p className="font-semibold text-lg">{order.restaurant?.name || 'Restaurant Not Found'}</p>
        <p className="text-sm text-gray-600">Order ID: {order._id}</p>
        <p className="text-sm text-gray-600">Total: ₹{order.totalAmount.toFixed(2)}</p>
        <p className={`text-sm font-semibold ${order.status === 'Delivered' ? 'text-green-600' : 'text-orange-600'}`}>
          Status: {order.status}
        </p>
      </div>
      <Link to={`/orders/${order._id}`} className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 whitespace-nowrap">
        {['Delivered', 'Cancelled'].includes(order.status) ? 'View Details' : 'Track Order'}
      </Link>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>
      
      {/* Section for Active Orders */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Active Orders</h2>
        {activeOrders.length > 0 ? (
          <div className="space-y-4">
            {activeOrders.map(order => <OrderCard key={order._id} order={order} />)}
          </div>
        ) : (
          <p className="text-gray-500">You have no active orders to track.</p>
        )}
      </div>

      {/* Section for Past Orders */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Past Orders</h2>
        {pastOrders.length > 0 ? (
           <div className="space-y-4">
            {pastOrders.map(order => <OrderCard key={order._id} order={order} />)}
          </div>
        ) : (
           <p className="text-gray-500">You have no past orders.</p>
        )}
      </div>

      {/* Show this only if there are no orders of any kind */}
      {activeOrders.length === 0 && pastOrders.length === 0 && (
         <div className="text-center py-16 px-6 bg-white rounded-lg shadow-md mt-8">
          <div className="text-6xl mb-4">🍽️</div>
          <h2 className="text-2xl font-semibold mb-2">No Order History</h2>
          <p className="text-gray-500 mb-6">
            It looks like you haven't placed any orders yet. Let's fix that!
          </p>
          <Link 
            to="/" 
            className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
          >
            Find Restaurants Near You
          </Link>
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;