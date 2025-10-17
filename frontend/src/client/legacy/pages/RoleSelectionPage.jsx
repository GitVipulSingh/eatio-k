// client/src/pages/RoleSelectionPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const RoleSelectionPage = () => {
  return (
    <div className="container mx-auto max-w-lg text-center py-20">
      <h1 className="text-4xl font-bold mb-8">Join Us!</h1>
      <p className="text-gray-600 mb-12">
        How would you like to sign up?
      </p>
      <div className="flex flex-col md:flex-row gap-6 justify-center">
        {/* Card for Customer Registration */}
        <Link 
          to="/register/customer" 
          className="p-8 border rounded-lg shadow-lg w-full md:w-64 text-center hover:shadow-xl transition-shadow bg-white"
        >
          <div className="text-5xl mb-4">👤</div>
          <h2 className="text-2xl font-semibold mb-2">As a Customer</h2>
          <p className="text-gray-500">
            Sign up to order delicious food from the best restaurants near you.
          </p>
        </Link>
        
        {/* Card for Restaurant Partner Registration */}
        <Link 
          to="/register/admin" 
          className="p-8 border rounded-lg shadow-lg w-full md:w-64 text-center hover:shadow-xl transition-shadow bg-white"
        >
          <div className="text-5xl mb-4">🏪</div>
          <h2 className="text-2xl font-semibold mb-2">As a Restaurant Partner</h2>
          <p className="text-gray-500">
            Join our network to reach more customers and grow your business.
          </p>
        </Link>
      </div>
    </div>
  );
};

export default RoleSelectionPage;