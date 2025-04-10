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
        loginMethods: ['email', 'google'],
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
        // Disable analytics to fix the CORS issues
        analytics: false,
        // Add local development configuration
        environment: process.env.NODE_ENV === 'development' ? 'development' : 'production',
      }}
    >
        <BrowserRouter>
      <App />
      </BrowserRouter>
    </PrivyProvider>
  </React.StrictMode>,
);