// admin/src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import axios from 'axios';

// Centralized API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const apiConfig = { withCredentials: true };

// Create axios instance for admin API calls
const adminApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15000,
});

// --- Super Admin Panel for Approving Restaurants ---
const SuperAdminPanel = () => {
  const [pendingRestaurants, setPendingRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const apiConfig = { withCredentials: true };

  const fetchPending = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.get('/admin/restaurants/pending');
      setPendingRestaurants(data);
    } catch (error) {
      console.error("Failed to fetch pending restaurants", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await adminApi.put(`/admin/restaurants/${id}/status`, { status });
      setIsModalOpen(false);
      fetchPending();
    } catch (error) {
      console.error("Failed to update status", error);
      alert("Failed to update status.");
    }
  };

  const openModal = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRestaurant(null);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl md:text-3xl font-bold mb-6">Super Admin: Pending Approvals</h2>
      {loading ? <p>Loading pending restaurants...</p> : (
        <div className="space-y-4">
          {pendingRestaurants.length === 0 ? <p>No restaurants are currently pending approval.</p> :
            pendingRestaurants.map(resto => (
              <div key={resto._id} className="bg-white p-4 rounded-lg shadow-md border flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div className="flex-1">
                  <p className="font-bold text-lg">{resto.name}</p>
                  <p className="text-sm text-gray-600 break-words">{resto.owner?.name || 'N/A'} ({resto.owner?.email || 'N/A'})</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button 
                    onClick={() => openModal(resto)} 
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 text-sm w-full sm:w-auto"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {selectedRestaurant && (
        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          contentLabel="Restaurant Details"
          className="bg-white rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-2xl mx-4 sm:mx-auto my-4 sm:my-12 outline-none max-h-[90vh] overflow-y-auto"
          overlayClassName="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
        >
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Review Restaurant Details</h2>
          <div className="space-y-4">
            <div><strong>Restaurant Name:</strong> <span className="break-words">{selectedRestaurant.name}</span></div>
            <div><strong>Owner Name:</strong> <span className="break-words">{selectedRestaurant.owner?.name}</span></div>
            <div><strong>Owner Email:</strong> <span className="break-words">{selectedRestaurant.owner?.email}</span></div>
            <div><strong>Owner Phone:</strong> <span className="break-words">{selectedRestaurant.owner?.phone}</span></div>
            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Submitted Documents</h3>
              <ul className="list-disc list-inside space-y-2">
                <li><a href={selectedRestaurant.documents?.fssaiLicenseUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-words">View FSSAI License</a></li>
                <li><a href={selectedRestaurant.documents?.shopEstablishmentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-words">View Shop Establishment</a></li>
                <li><a href={selectedRestaurant.documents?.ownerPhotoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-words">View Owner Photo</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row sm:justify-end gap-2 sm:gap-4 border-t pt-4">
            <button 
              onClick={() => handleStatusUpdate(selectedRestaurant._id, 'approved')} 
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 order-1"
            >
              Approve
            </button>
            <button 
              onClick={() => handleStatusUpdate(selectedRestaurant._id, 'rejected')} 
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 order-2"
            >
              Reject
            </button>
            <button 
              onClick={closeModal} 
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 order-3"
            >
              Close
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};


// --- Regular Admin Dashboard for Menu Management ---
const AdminDashboard = ({ adminInfo, restaurant, fetchRestaurant }) => {
    // All existing states for menu management
    const [editingItemId, setEditingItemId] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [editImageFile, setEditImageFile] = useState(null);
    const [newItem, setNewItem] = useState({ name: '', description: '', price: '', category: 'Appetizer' });
    const [newImage, setNewImage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    
    // --- NEW: State and functions for order management ---
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const apiConfig = { withCredentials: true };

    const fetchOrders = async () => {
        if (restaurant?._id) {
            setLoadingOrders(true);
            try {
                const { data } = await adminApi.get('/admin/orders');
                setOrders(data);
            } catch (error) {
                console.error("Failed to fetch orders", error);
            } finally {
                setLoadingOrders(false);
            }
        }
    };

    // Fetch orders when the component mounts and when the restaurant data is available
    useEffect(() => {
        fetchOrders();
    }, [restaurant]);

    const handleOrderStatusChange = async (orderId, newStatus) => {
        try {
            // This is the call that will trigger the Socket.IO broadcast on the backend
            await adminApi.put(`/admin/orders/${orderId}/status`, { status: newStatus });
            fetchOrders(); // Refetch to update the admin's view
        } catch (error) {
            console.error("Failed to update order status", error);
            alert("Failed to update order status.");
        }
    };
    // --- END NEW ---

    // --- All existing helper functions for menu management ---
    const handleToggleAvailability = async (menuItemId, isAvailable) => {
      try {
        await adminApi.put(`/restaurants/menu/${menuItemId}`, { isAvailable: !isAvailable });
        fetchRestaurant();
      } catch (error) {
        console.error("Failed to toggle availability", error);
      }
    };

    const handleDelete = async (menuItemId) => {
      if (window.confirm('Are you sure you want to delete this item?')) {
        try {
          await adminApi.delete(`/restaurants/menu/${menuItemId}`);
          fetchRestaurant();
        } catch (error) {
          console.error("Failed to delete item", error);
        }
      }
    };

    const handleEditClick = (item) => {
      setEditingItemId(item._id);
      setEditFormData({ ...item });
      setEditImageFile(null);
    };

    const handleCancelEdit = () => {
      setEditingItemId(null);
    };
    
    const handleEditFormChange = (e) => {
      setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    };
    
    const handleEditImageChange = (e) => {
      setEditImageFile(e.target.files[0]);
    };

    const uploadFile = async (file) => {
      if (!file) return null;
      const formData = new FormData();
      formData.append('image', file);
      try {
        const { data } = await adminApi.post('/upload', formData, { 
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        return data.imageUrl;
      } catch (err) {
        throw new Error('File upload failed');
      }
    };

    const handleSaveEdit = async (menuItemId) => {
      try {
        let updatedData = { ...editFormData };
        if (editImageFile) {
          const newImageUrl = await uploadFile(editImageFile);
          updatedData.image = newImageUrl;
        }
        await adminApi.put(`/restaurants/menu/${menuItemId}`, updatedData);
        setEditingItemId(null);
        fetchRestaurant();
      } catch (error) {
        console.error("Failed to save changes", error);
        alert("Failed to save changes.");
      }
    };

    const handleNewItemChange = (e) => {
      setNewItem({ ...newItem, [e.target.name]: e.target.value });
    };

    const handleNewImageChange = (e) => {
      setNewImage(e.target.files[0]);
    };

    const handleAddItem = async (e) => {
      e.preventDefault();
      if (!newImage) {
        setMessage('Please select an image for the new item.');
        return;
      }
      setIsSubmitting(true);
      setMessage('');
      try {
        const imageUrl = await uploadFile(newImage);
        if (!imageUrl) throw new Error("Image upload returned no URL");
        const newItemData = { ...newItem, price: Number(newItem.price), image: imageUrl };
        await adminApi.post('/restaurants/menu', newItemData);
        
        setMessage('Item added successfully!');
        setNewItem({ name: '', description: '', price: '', category: 'Appetizer' });
        setNewImage(null);
        document.getElementById('new-image-input').value = null;
        fetchRestaurant();
      } catch (error) {
        console.error("Failed to add item", error);
        setMessage(error.response?.data?.message || 'Failed to add item.');
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        <div className="xl:col-span-1">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Add New Item</h2>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={newItem.name} 
                  onChange={handleNewItemChange} 
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  name="description" 
                  value={newItem.description} 
                  onChange={handleNewItemChange} 
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
                  rows="3"
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                <input 
                  type="number" 
                  name="price" 
                  value={newItem.price} 
                  onChange={handleNewItemChange} 
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select 
                  name="category" 
                  value={newItem.category} 
                  onChange={handleNewItemChange} 
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option>Appetizer</option>
                  <option>Main Course</option>
                  <option>Dessert</option>
                  <option>Beverage</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                <input 
                  type="file" 
                  id="new-image-input" 
                  onChange={handleNewImageChange} 
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
                  accept="image/*"
                  required 
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Adding...' : 'Add Item to Menu'}
              </button>
              {message && <p className="text-center mt-2 text-sm text-green-600">{message}</p>}
            </form>
          </div>
        </div>

        <div className="xl:col-span-2">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Manage Your Menu</h2>
          
          {/* Mobile Card View */}
          <div className="block lg:hidden space-y-4">
            {restaurant.menuItems.map(item => (
              <div key={item._id} className="bg-white p-4 rounded-lg shadow border">
                {editingItemId === item._id ? (
                  <div className="space-y-4">
                    <input 
                      type="text" 
                      name="name" 
                      value={editFormData.name} 
                      onChange={handleEditFormChange} 
                      className="w-full border border-gray-300 p-3 rounded-lg" 
                      placeholder="Name" 
                    />
                    <textarea 
                      name="description" 
                      value={editFormData.description} 
                      onChange={handleEditFormChange} 
                      className="w-full border border-gray-300 p-3 rounded-lg" 
                      placeholder="Description"
                      rows="3"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input 
                        type="number" 
                        name="price" 
                        value={editFormData.price} 
                        onChange={handleEditFormChange} 
                        className="border border-gray-300 p-3 rounded-lg" 
                        placeholder="Price" 
                      />
                      <select 
                        name="category" 
                        value={editFormData.category} 
                        onChange={handleEditFormChange} 
                        className="border border-gray-300 p-3 rounded-lg"
                      >
                        <option>Appetizer</option>
                        <option>Main Course</option>
                        <option>Dessert</option>
                        <option>Beverage</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Update Image (optional)</label>
                      <input 
                        type="file" 
                        onChange={handleEditImageChange} 
                        className="w-full border border-gray-300 p-3 rounded-lg" 
                        accept="image/*"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleSaveEdit(item._id)} 
                        className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                      >
                        Save
                      </button>
                      <button 
                        onClick={handleCancelEdit} 
                        className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start gap-4 mb-3">
                      <img 
                        src={item.image || 'https://placehold.co/100x100/eee/ccc?text=No+Image'} 
                        alt={item.name} 
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0" 
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">{item.name}</h3>
                        <p className="text-gray-600 text-sm line-clamp-2">{item.description}</p>
                        <p className="text-lg font-bold text-green-600 mt-1">₹{item.price}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <button 
                        onClick={() => handleToggleAvailability(item._id, item.isAvailable)} 
                        className={`px-3 py-1 text-sm rounded-full text-white font-medium ${item.isAvailable ? 'bg-green-500' : 'bg-red-500'}`}
                      >
                        {item.isAvailable ? 'Available' : 'Unavailable'}
                      </button>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEditClick(item)} 
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(item._id)} 
                          className="text-red-600 hover:text-red-800 font-medium text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-medium">Item</th>
                    <th className="text-left p-4 font-medium">Price</th>
                    <th className="text-left p-4 font-medium">Available</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {restaurant.menuItems.map(item => (
                    <tr key={item._id} className="border-b hover:bg-gray-50">
                      {editingItemId === item._id ? (
                        <td colSpan="4" className="p-4 bg-gray-50">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <input 
                              type="text" 
                              name="name" 
                              value={editFormData.name} 
                              onChange={handleEditFormChange} 
                              className="border border-gray-300 p-2 rounded col-span-full" 
                              placeholder="Name" 
                            />
                            <textarea 
                              name="description" 
                              value={editFormData.description} 
                              onChange={handleEditFormChange} 
                              className="border border-gray-300 p-2 rounded col-span-full" 
                              placeholder="Description"
                              rows="3"
                            />
                            <input 
                              type="number" 
                              name="price" 
                              value={editFormData.price} 
                              onChange={handleEditFormChange} 
                              className="border border-gray-300 p-2 rounded" 
                              placeholder="Price" 
                            />
                            <select 
                              name="category" 
                              value={editFormData.category} 
                              onChange={handleEditFormChange} 
                              className="border border-gray-300 p-2 rounded"
                            >
                              <option>Appetizer</option>
                              <option>Main Course</option>
                              <option>Dessert</option>
                              <option>Beverage</option>
                            </select>
                            <div className="col-span-full">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Update Image (optional)</label>
                              <input 
                                type="file" 
                                onChange={handleEditImageChange} 
                                className="w-full border border-gray-300 p-2 rounded" 
                                accept="image/*"
                              />
                            </div>
                          </div>
                          <div className="mt-4 flex gap-2">
                            <button 
                              onClick={() => handleSaveEdit(item._id)} 
                              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                            >
                              Save
                            </button>
                            <button 
                              onClick={handleCancelEdit} 
                              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      ) : (
                        <>
                          <td className="p-4">
                            <div className="flex items-center gap-4">
                              <img 
                                src={item.image || 'https://placehold.co/100x100/eee/ccc?text=No+Image'} 
                                alt={item.name} 
                                className="w-16 h-16 object-cover rounded-md flex-shrink-0" 
                              />
                              <div className="min-w-0">
                                <div className="font-medium">{item.name}</div>
                                <div className="text-sm text-gray-500 truncate">{item.description}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 font-semibold">₹{item.price}</td>
                          <td className="p-4">
                            <button 
                              onClick={() => handleToggleAvailability(item._id, item.isAvailable)} 
                              className={`px-3 py-1 text-sm rounded-full text-white font-medium ${item.isAvailable ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
                            >
                              {item.isAvailable ? 'Yes' : 'No'}
                            </button>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleEditClick(item)} 
                                className="text-blue-600 hover:text-blue-800 font-medium"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDelete(item._id)} 
                                className="text-red-600 hover:text-red-800 font-medium"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
           {/* --- NEW SECTION: MANAGE ORDERS --- */}
          <div className="mt-12 border-t pt-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">Manage Incoming Orders</h2>
              
              {loadingOrders ? (
                <div className="text-center p-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                  <p className="mt-2 text-gray-600">Loading orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow text-center">
                  <div className="text-6xl mb-4">📋</div>
                  <p className="text-gray-600 text-lg">No incoming orders at the moment.</p>
                  <p className="text-gray-500 text-sm mt-2">New orders will appear here automatically.</p>
                </div>
              ) : (
                <>
                  {/* Mobile Card View */}
                  <div className="block lg:hidden space-y-4">
                    {orders.map(order => (
                      <div key={order._id} className="bg-white p-4 rounded-lg shadow border">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-500 truncate">Order #{order._id.slice(-8)}</p>
                            <p className="font-semibold text-lg">{order.user?.name || 'N/A'}</p>
                            <p className="text-lg font-bold text-green-600">₹{order.totalAmount.toFixed(2)}</p>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                            order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'Confirmed' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'Preparing' ? 'bg-orange-100 text-orange-800' :
                            order.status === 'Out for Delivery' ? 'bg-purple-100 text-purple-800' :
                            order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {order.status}
                          </div>
                        </div>
                        
                        {/* Order Items */}
                        {order.items && order.items.length > 0 && (
                          <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm font-medium text-gray-700 mb-2">Items:</p>
                            <div className="space-y-1">
                              {order.items.slice(0, 2).map((item, index) => (
                                <p key={index} className="text-sm text-gray-600">
                                  {item.quantity}x {item.name}
                                </p>
                              ))}
                              {order.items.length > 2 && (
                                <p className="text-sm text-gray-500">+{order.items.length - 2} more items</p>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <div className="border-t pt-3">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Update Status:</label>
                          <select 
                            value={order.status} 
                            onChange={(e) => handleOrderStatusChange(order._id, e.target.value)} 
                            className="w-full border border-gray-300 p-3 rounded-lg bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          >
                            <option>Pending</option>
                            <option>Confirmed</option>
                            <option>Preparing</option>
                            <option>Out for Delivery</option>
                            <option>Delivered</option>
                            <option>Cancelled</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden lg:block bg-white shadow rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full table-auto">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="text-left p-4 font-medium">Order ID</th>
                            <th className="text-left p-4 font-medium">Customer</th>
                            <th className="text-left p-4 font-medium">Items</th>
                            <th className="text-left p-4 font-medium">Total</th>
                            <th className="text-left p-4 font-medium">Status</th>
                            <th className="text-left p-4 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map(order => (
                            <tr key={order._id} className="border-b hover:bg-gray-50">
                              <td className="p-4">
                                <span className="text-sm text-gray-600 font-mono">#{order._id.slice(-8)}</span>
                              </td>
                              <td className="p-4">
                                <div>
                                  <div className="font-medium">{order.user?.name || 'N/A'}</div>
                                  <div className="text-sm text-gray-500">{order.user?.email || ''}</div>
                                </div>
                              </td>
                              <td className="p-4">
                                {order.items && order.items.length > 0 ? (
                                  <div className="text-sm">
                                    <div>{order.items[0].quantity}x {order.items[0].name}</div>
                                    {order.items.length > 1 && (
                                      <div className="text-gray-500">+{order.items.length - 1} more</div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-gray-400">No items</span>
                                )}
                              </td>
                              <td className="p-4 font-semibold text-green-600">₹{order.totalAmount.toFixed(2)}</td>
                              <td className="p-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                  order.status === 'Confirmed' ? 'bg-blue-100 text-blue-800' :
                                  order.status === 'Preparing' ? 'bg-orange-100 text-orange-800' :
                                  order.status === 'Out for Delivery' ? 'bg-purple-100 text-purple-800' :
                                  order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {order.status}
                                </span>
                              </td>
                              <td className="p-4">
                                <select 
                                  value={order.status} 
                                  onChange={(e) => handleOrderStatusChange(order._id, e.target.value)} 
                                  className="border border-gray-300 p-2 rounded-md bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                                >
                                  <option>Pending</option>
                                  <option>Confirmed</option>
                                  <option>Preparing</option>
                                  <option>Out for Delivery</option>
                                  <option>Delivered</option>
                                  <option>Cancelled</option>
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
          </div>
          {/* --- END OF NEW SECTION --- */}
        </div>
      </div>
    );
};


// --- Main Dashboard Page ---
const DashboardPage = ({ adminInfo }) => {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRestaurant = async () => {
    if (adminInfo?.role === 'admin') {
      try {
        const { data } = await adminApi.get('/restaurants/my-restaurant');
        setRestaurant(data);
      } catch (error) {
        console.error("Failed to fetch restaurant", error);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminInfo) {
      fetchRestaurant();
    }
  }, [adminInfo]);

  const handleLogout = async () => {
    try {
      await adminApi.post('/auth/logout');
      // Navigate to login within the same app
      window.location.href = '/auth/login';
    } catch (error) {
      // Even on error, redirect to login
      window.location.href = '/auth/login';
    }
  };
  
  if (loading) return <div>Loading Dashboard...</div>;
  if (adminInfo?.role === 'admin' && !restaurant) return <div>Could not load your restaurant data. Make sure it's approved.</div>;

  return (
    <div>
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h1 className="text-lg sm:text-xl font-bold truncate">
              {adminInfo?.role === 'superadmin' ? 'Super Admin' : (restaurant?.name || 'Admin')} - Dashboard
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <span className="text-sm sm:text-base">Welcome, {adminInfo?.name}</span>
              <button 
                onClick={handleLogout} 
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-sm sm:text-base"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* --- CONDITIONAL RENDERING --- */}
        {adminInfo?.role === 'admin' && restaurant && <AdminDashboard adminInfo={adminInfo} restaurant={restaurant} fetchRestaurant={fetchRestaurant} />}
        {adminInfo?.role === 'superadmin' && <SuperAdminPanel />}
      </div>
    </div>
  );
};

export default DashboardPage;

