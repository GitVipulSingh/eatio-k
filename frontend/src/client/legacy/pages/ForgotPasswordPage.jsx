// client/src/pages/ForgotPasswordPage.jsx

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { forgotPassword, resetPassword, clearMessages } from '../store/slices/authSlice';

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1); // 1: Enter phone, 2: Enter OTP & new password
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { status, error, message } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearMessages());
  }, [dispatch]);

  const handleSendOtp = (e) => {
    e.preventDefault();
    dispatch(forgotPassword(phone)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        setStep(2);
      }
    });
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    dispatch(resetPassword({ phone, otp, newPassword })).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        setTimeout(() => {
          navigate('/login');
        }, 3000); // Wait 3 seconds before redirecting
      }
    });
  };

  return (
    <div className="container mx-auto max-w-sm px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-6">Reset Password</h1>
      
      {step === 1 && (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label htmlFor="phone">Enter your registered phone number</label>
            <input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 border rounded-lg" required />
          </div>
          <button type="submit" className="w-full bg-orange-500 text-white py-2 rounded-lg" disabled={status === 'loading'}>
            {status === 'loading' ? 'Sending...' : 'Send Reset OTP'}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <p className="text-center">An OTP has been sent to {phone}.</p>
          <div>
            <label>Enter OTP</label>
            <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full px-3 py-2 border rounded-lg" required />
          </div>
          <div>
            <label>Enter New Password</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-3 py-2 border rounded-lg" required />
          </div>
          <button type="submit" className="w-full bg-green-500 text-white py-2 rounded-lg" disabled={status === 'loading'}>
            {status === 'loading' ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      )}

      {error && <p className="text-red-500 text-center mt-4">{error}</p>}
      {message && <p className="text-green-500 text-center mt-4">{message}</p>}
    </div>
  );
};

export default ForgotPasswordPage;
