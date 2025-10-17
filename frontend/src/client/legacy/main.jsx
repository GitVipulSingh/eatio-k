// client/src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// --- Redux Imports ---
import { store } from './store/store.js';
import { Provider } from 'react-redux';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* The Provider component makes the Redux store available to any nested components that need to access it. */}
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
);
