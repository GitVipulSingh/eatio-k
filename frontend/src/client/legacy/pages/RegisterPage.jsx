// client/src/pages/RegisterPage.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { registerUser, clearMessages } from '../store/slices/authSlice';
import api from '../api/apiService';

const RegisterPage = () => {
  const location = useLocation();
  const role = location.pathname.includes('/admin') ? 'admin' : 'customer';

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '',
    restaurantName: '', street: '', city: '', pincode: '', fssaiLicenseNumber: ''
  });
  const [documents, setDocuments] = useState({
    fssaiLicense: null,
    shopEstablishment: null,
    ownerPhoto: null,
  });
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearMessages());
  }, [dispatch, role]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setDocuments({ ...documents, [e.target.name]: e.target.files[0] });
  };

  const uploadFile = async (file) => {
    if (!file) return null;
    const uploadFormData = new FormData();
    uploadFormData.append('image', file);
    try {
      const { data } = await api.post('/upload', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
      return data.imageUrl;
    } catch (err) {
      console.error('File upload error:', err);
      throw new Error('File upload failed for ' + file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let registrationData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      role: role,
    };

    if (role === 'admin') {
      try {
        const [fssaiUrl, shopUrl, ownerPhotoUrl] = await Promise.all([
          uploadFile(documents.fssaiLicense),
          uploadFile(documents.shopEstablishment),
          uploadFile(documents.ownerPhoto)
        ]);

        registrationData.restaurantDetails = {
          restaurantName: formData.restaurantName,
          address: {
            street: formData.street, city: formData.city, pincode: formData.pincode,
            location: { type: 'Point', coordinates: [0, 0] }
          },
          cuisine: ['Multi-Cuisine'],
          fssaiLicenseNumber: formData.fssaiLicenseNumber,
          documents: {
            fssaiLicenseUrl: fssaiUrl,
            shopEstablishmentUrl: shopUrl,
            ownerPhotoUrl: ownerPhotoUrl,
          }
        };
      } catch (uploadError) {
        alert(uploadError.message);
        return;
      }
    }

    dispatch(registerUser(registrationData)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        const user = result.payload;
        if (user.role === 'admin') {
          alert('Registration successful! Your restaurant is pending approval.');
          window.location.href = 'http://localhost:5174'; 
        } else {
          navigate('/');
        }
      }
    });
  };

  return (
    <div className="container mx-auto max-w-lg px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-6">
        {role === 'customer' ? 'Create a Customer Account' : 'Register as a Restaurant Partner'}
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-xl font-semibold border-b pb-2">Your Details</h2>
        <div>
          <label>Full Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label>Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label>Phone</label>
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label>Password</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>

        {role === 'admin' && (
          <>
            <h2 className="text-xl font-semibold border-b pb-2 pt-4">Restaurant Details</h2>
            <div>
              <label>Restaurant Name</label>
              <input type="text" name="restaurantName" value={formData.restaurantName} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label>Street Address</label>
              <input type="text" name="street" value={formData.street} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div className="flex gap-4">
              <div className="w-1/2"><label>City</label><input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" required /></div>
              <div className="w-1/2"><label>Pincode</label><input type="text" name="pincode" value={formData.pincode} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" required /></div>
            </div>
            <div>
              <label>FSSAI License Number</label>
              <input type="text" name="fssaiLicenseNumber" value={formData.fssaiLicenseNumber} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            
            <h3 className="text-lg font-semibold pt-4">Upload Documents (Image or PDF)</h3>
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
              <div><label className="block text-gray-700 mb-1 font-medium">FSSAI License</label><input type="file" name="fssaiLicense" onChange={handleFileChange} className="w-full" required /></div>
              <div><label className="block text-gray-700 mb-1 font-medium">Shop Certificate</label><input type="file" name="shopEstablishment" onChange={handleFileChange} className="w-full" required /></div>
              <div><label className="block text-gray-700 mb-1 font-medium">Owner's Photo ID</label><input type="file" name="ownerPhoto" onChange={handleFileChange} className="w-full" required /></div>
            </div>
          </>
        )}

        <button type="submit" className="w-full bg-green-500 text-white py-2 rounded-lg" disabled={status === 'loading'}>
          {status === 'loading' ? 'Submitting...' : 'Create Account'}
        </button>
      </form>

      {error && <p className="text-red-500 text-center mt-4">{error}</p>}
      <p className="text-center text-gray-600 mt-4">
        Already have an account? <Link to="/login" className="text-orange-500 hover:underline">Login</Link>
      </p>
    </div>
  );
};

export default RegisterPage;