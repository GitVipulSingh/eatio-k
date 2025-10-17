// admin/src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import axios from 'axios';

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
      const { data } = await axios.get('http://localhost:5000/api/admin/restaurants/pending', apiConfig);
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
      await axios.put(`http://localhost:5000/api/admin/restaurants/${id}/status`, { status }, apiConfig);
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
      <h2 className="text-3xl font-bold mb-6">Super Admin: Pending Approvals</h2>
      {loading ? <p>Loading pending restaurants...</p> : (
        <div className="space-y-4">
          {pendingRestaurants.length === 0 ? <p>No restaurants are currently pending approval.</p> :
            pendingRestaurants.map(resto => (
              <div key={resto._id} className="bg-white p-4 rounded-lg shadow-md border flex justify-between items-center">
                <div>
                  <p className="font-bold text-lg">{resto.name}</p>
                  <p className="text-sm text-gray-600">{resto.owner?.name || 'N/A'} ({resto.owner?.email || 'N/A'})</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openModal(resto)} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">View Details</button>
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
          className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-auto my-12 outline-none"
          overlayClassName="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
        >
          <h2 className="text-2xl font-bold mb-4">Review Restaurant Details</h2>
          <div className="space-y-4">
            <div><strong>Restaurant Name:</strong> {selectedRestaurant.name}</div>
            <div><strong>Owner Name:</strong> {selectedRestaurant.owner?.name}</div>
            <div><strong>Owner Email:</strong> {selectedRestaurant.owner?.email}</div>
            <div><strong>Owner Phone:</strong> {selectedRestaurant.owner?.phone}</div>
            <div className="border-t pt-4 mt-4">
              <h3 className="text-xl font-semibold mb-2">Submitted Documents</h3>
              <ul className="list-disc list-inside space-y-2">
                <li><a href={selectedRestaurant.documents?.fssaiLicenseUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View FSSAI License</a></li>
                <li><a href={selectedRestaurant.documents?.shopEstablishmentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View Shop Establishment</a></li>
                <li><a href={selectedRestaurant.documents?.ownerPhotoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View Owner Photo</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-4 border-t pt-4">
            <button onClick={() => handleStatusUpdate(selectedRestaurant._id, 'approved')} className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">Approve</button>
            <button onClick={() => handleStatusUpdate(selectedRestaurant._id, 'rejected')} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">Reject</button>
            <button onClick={closeModal} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400">Close</button>
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
                const { data } = await axios.get('http://localhost:5000/api/admin/orders', apiConfig);
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
            await axios.put(`http://localhost:5000/api/admin/orders/${orderId}/status`, { status: newStatus }, apiConfig);
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
        await axios.put(`http://localhost:5000/api/restaurants/menu/${menuItemId}`, { isAvailable: !isAvailable }, apiConfig);
        fetchRestaurant();
      } catch (error) {
        console.error("Failed to toggle availability", error);
      }
    };

    const handleDelete = async (menuItemId) => {
      if (window.confirm('Are you sure you want to delete this item?')) {
        try {
          await axios.delete(`http://localhost:5000/api/restaurants/menu/${menuItemId}`, apiConfig);
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
        const { data } = await axios.post('http://localhost:5000/api/upload', formData, { 
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true 
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
        await axios.put(`http://localhost:5000/api/restaurants/menu/${menuItemId}`, updatedData, apiConfig);
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
        await axios.post('http://localhost:5000/api/restaurants/menu', newItemData, apiConfig);
        
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">Add New Item</h2>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div><label>Name</label><input type="text" name="name" value={newItem.name} onChange={handleNewItemChange} className="w-full border p-2 rounded" required /></div>
              <div><label>Description</label><textarea name="description" value={newItem.description} onChange={handleNewItemChange} className="w-full border p-2 rounded" required /></div>
              <div><label>Price</label><input type="number" name="price" value={newItem.price} onChange={handleNewItemChange} className="w-full border p-2 rounded" required /></div>
              <div><label>Category</label><select name="category" value={newItem.category} onChange={handleNewItemChange} className="w-full border p-2 rounded"><option>Appetizer</option><option>Main Course</option><option>Dessert</option><option>Beverage</option></select></div>
              <div><label>Image</label><input type="file" id="new-image-input" onChange={handleNewImageChange} className="w-full" required /></div>
              <button type="submit" className="w-full bg-green-500 text-white py-2 rounded-lg" disabled={isSubmitting}>{isSubmitting ? 'Adding...' : 'Add Item to Menu'}</button>
              {message && <p className="text-center mt-2">{message}</p>}
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-4">Manage Your Menu</h2>
          <div className="bg-white shadow rounded-lg overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-gray-50 border-b"><tr><th className="text-left p-4 font-medium">Item</th><th className="text-left p-4 font-medium">Price</th><th className="text-left p-4 font-medium">Available</th><th className="text-left p-4 font-medium">Actions</th></tr></thead>
              <tbody>
                {restaurant.menuItems.map(item => (
                  <tr key={item._id} className="border-b">
                    {editingItemId === item._id ? (
                      <td colSpan="4" className="p-4 bg-gray-50">
                        <div className="grid grid-cols-2 gap-4">
                          <input type="text" name="name" value={editFormData.name} onChange={handleEditFormChange} className="border p-2 rounded col-span-2" placeholder="Name" />
                          <textarea name="description" value={editFormData.description} onChange={handleEditFormChange} className="border p-2 rounded col-span-2" placeholder="Description" />
                          <input type="number" name="price" value={editFormData.price} onChange={handleEditFormChange} className="border p-2 rounded" placeholder="Price" />
                          <select name="category" value={editFormData.category} onChange={handleEditFormChange} className="border p-2 rounded"><option>Appetizer</option><option>Main Course</option><option>Dessert</option><option>Beverage</option></select>
                          <div className="col-span-2"><label className="block text-sm font-medium text-gray-700">Update Image (optional)</label><input type="file" onChange={handleEditImageChange} className="mt-1 w-full text-sm" /></div>
                        </div>
                        <div className="mt-4 flex gap-2"><button onClick={() => handleSaveEdit(item._id)} className="px-4 py-2 bg-green-500 text-white rounded">Save</button><button onClick={handleCancelEdit} className="px-4 py-2 bg-gray-300 rounded">Cancel</button></div>
                      </td>
                    ) : (
                      <>
                        <td className="p-4 flex items-center gap-4"><img src={item.image || 'https://placehold.co/100x100/eee/ccc?text=No+Image'} alt={item.name} className="w-16 h-16 object-cover rounded-md" /><span>{item.name}</span></td>
                        <td className="p-4">₹{item.price}</td>
                        <td className="p-4"><button onClick={() => handleToggleAvailability(item._id, item.isAvailable)} className={`px-3 py-1 text-sm rounded-full text-white ${item.isAvailable ? 'bg-green-500' : 'bg-red-500'}`}>{item.isAvailable ? 'Yes' : 'No'}</button></td>
                        <td className="p-4 flex gap-2"><button onClick={() => handleEditClick(item)} className="text-blue-600 hover:underline">Edit</button><button onClick={() => handleDelete(item._id)} className="text-red-600 hover:underline">Delete</button></td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
           {/* --- NEW SECTION: MANAGE ORDERS --- */}
          <div className="mt-12 border-t pt-8">
              <h2 className="text-2xl font-bold mb-4">Manage Incoming Orders</h2>
              <div className="bg-white shadow rounded-lg overflow-x-auto">
                 <table className="w-full table-auto">
                      <thead className="bg-gray-50 border-b">
                          <tr>
                              <th className="text-left p-4 font-medium">Order ID</th>
                              <th className="text-left p-4 font-medium">Customer</th>
                              <th className="text-left p-4 font-medium">Total</th>
                              <th className="text-left p-4 font-medium">Status</th>
                          </tr>
                      </thead>
                      <tbody>
                          {loadingOrders ? (
                              <tr><td colSpan="4" className="text-center p-4">Loading orders...</td></tr>
                          ) : orders.length === 0 ? (
                              <tr><td colSpan="4" className="text-center p-4">No incoming orders.</td></tr>
                          ) : (
                              orders.map(order => (
                                  <tr key={order._id} className="border-b">
                                      <td className="p-4 text-sm text-gray-600">{order._id}</td>
                                      <td className="p-4">{order.user?.name || 'N/A'}</td>
                                      <td className="p-4">₹{order.totalAmount.toFixed(2)}</td>
                                      <td className="p-4">
                                          <select 
                                              value={order.status} 
                                              onChange={(e) => handleOrderStatusChange(order._id, e.target.value)} 
                                              className="border p-2 rounded-md bg-gray-50 focus:ring-orange-500 focus:border-orange-500"
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
                              ))
                          )}
                      </tbody>
                 </table>
              </div>
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
        const { data } = await axios.get('http://localhost:5000/api/restaurants/my-restaurant', { withCredentials: true });
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
      await axios.post('http://localhost:5000/api/auth/logout', {}, { withCredentials: true });
      window.location.href = import.meta.env.VITE_CLIENT_URL || 'http://localhost:5174/login';
    } catch (error) {
      window.location.href = import.meta.env.VITE_CLIENT_URL || 'http://localhost:5174/login';
    }
  };
  
  if (loading) return <div>Loading Dashboard...</div>;
  if (adminInfo?.role === 'admin' && !restaurant) return <div>Could not load your restaurant data. Make sure it's approved.</div>;

  return (
    <div>
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">
            {adminInfo?.role === 'superadmin' ? 'Super Admin' : (restaurant?.name || 'Admin')} - Dashboard
          </h1>
          <div>
            <span>Welcome, {adminInfo?.name}</span>
            <button onClick={handleLogout} className="ml-4 bg-red-500 text-white px-3 py-1 rounded">Logout</button>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8">
        {/* --- CONDITIONAL RENDERING --- */}
        {adminInfo?.role === 'admin' && restaurant && <AdminDashboard adminInfo={adminInfo} restaurant={restaurant} fetchRestaurant={fetchRestaurant} />}
        {adminInfo?.role === 'superadmin' && <SuperAdminPanel />}
      </div>
    </div>
  );
};

export default DashboardPage;

