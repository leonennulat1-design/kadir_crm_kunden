import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { StoreProvider } from './store/StoreProvider.jsx';
import { ConfirmProvider } from './components/ConfirmProvider.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <StoreProvider>
      <ConfirmProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ConfirmProvider>
    </StoreProvider>
  </React.StrictMode>
);
