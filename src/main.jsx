import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';
import App from './App.jsx';
import './index.css';
import { AppStateProvider } from './state/AppStateContext.jsx';
import { AuthProvider } from './state/AuthContext.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <AppStateProvider>
        <AuthProvider>
          <App />
          <SpeedInsights />
        </AuthProvider>
      </AppStateProvider>
    </BrowserRouter>
  </React.StrictMode>
);
