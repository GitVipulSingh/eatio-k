// admin/src/App.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardPage from './pages/DashboardPage';

const AdminGatekeeper = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adminInfo, setAdminInfo] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const config = { withCredentials: true };
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const { data } = await axios.get(`${apiUrl}/users/profile`, config);
        
        // --- THIS IS THE FIX ---
        // Now checks for 'admin' OR 'superadmin'
        if (data && (data.role === 'admin' || data.role === 'superadmin')) {
          setIsAdmin(true);
          setAdminInfo(data);
        } else {
          // Navigate to login within the same app
          window.location.href = '/auth/login';
        }
        // --- END OF FIX ---
      } catch (error) {
        // Navigate to login within the same app
        window.location.href = '/auth/login';
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) {
    return <div className="text-center p-8">Verifying access...</div>;
  }

  return isAdmin ? <DashboardPage adminInfo={adminInfo} /> : null;
};

function App() {
  return <AdminGatekeeper />;
}

export default App;
