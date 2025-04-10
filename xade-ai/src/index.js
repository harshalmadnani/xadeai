import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import './fonts.css';
import {PrivyProvider} from '@privy-io/react-auth';

import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <PrivyProvider
      appId={process.env.REACT_APP_PRIVY_APP_ID}
      config={{
        // Display email and wallet as login methods
        loginMethods: ['email'],
        // Customize Privy's appearance in your app
        appearance: {
          theme: 'dark',
          accentColor: '#fff',
          logo: 'https://res.cloudinary.com/dcrfpsiiq/image/upload/v1739879774/finurkyzqfafkgfodgwh.png',
        },
        // Create embedded wallets for users who don't have a wallet
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
        // Completely disable analytics for CORS issues
        analytics: {
          isEnabled: false,
          forceDisableFetchRequests: true,
        },
        // Use no-cors mode for any remaining requests
        requestOptions: {
          mode: 'no-cors',
        },
        // Add development-specific configuration
        environment: process.env.NODE_ENV === 'development' ? 'development' : 'production',
        // Add allowed origins to fix permission issues
        allowedDomains: [
          'localhost:3000',
          'localhost:3001',
          new RegExp('^https?://localhost:30[0-9][0-9]$')
        ],
        // Disable iFrame usage to prevent Fullscreen permission issues
        iframeUrl: null
      }}
    >
        <BrowserRouter>
      <App />
      </BrowserRouter>
    </PrivyProvider>
  </React.StrictMode>,
);