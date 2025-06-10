import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // Per un CSS di base se vuoi

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);