import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ClerkProvider } from "@clerk/clerk-react";

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <ClerkProvider publishableKey={"pk_test_bW92aW5nLXVuaWNvcm4tNDUuY2xlcmsuYWNjb3VudHMuZGV2JA"}>
      <App />
    </ClerkProvider>
  </React.StrictMode>
);

reportWebVitals();
