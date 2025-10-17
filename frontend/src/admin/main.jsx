// admin/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import Modal from 'react-modal'; // <-- Import the modal library
import App from './App.jsx';
import './index.css';

// --- THIS IS THE CRITICAL CONFIGURATION STEP ---
// This tells the modal library which part of your app is the main content.
// It helps with accessibility by hiding the main app from screen readers when the modal is open.
Modal.setAppElement('#root');
// --- END OF CONFIGURATION ---

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
