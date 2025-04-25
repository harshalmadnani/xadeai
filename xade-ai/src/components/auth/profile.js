import React from 'react';
import { usePrivy } from '@privy-io/react-auth';

function Profile() {
  const { ready, authenticated, login, user, logout } = usePrivy();

  console.log('Profile user:', user);

  if (!ready) {
    return <div style={{ color: 'white', padding: '2rem' }}>Loading...</div>;
  }

  if (!authenticated) {
    return (
      <div style={{ color: 'white', padding: '2rem', textAlign: 'center' }}>
        <div style={{ marginBottom: '1rem' }}>You are not logged in.</div>
        <button onClick={login} style={{ padding: '0.5rem 1.5rem', fontSize: '1rem', borderRadius: '8px', border: 'none', background: '#fff', color: '#000', cursor: 'pointer' }}>Login</button>
      </div>
    );
  }

  const name = user?.name || user?.email || 'N/A';
  const email = user?.email || 'N/A';
  let walletAddress = 'N/A';
  if (user?.wallet) {
    if (typeof user.wallet === 'string') {
      walletAddress = user.wallet;
    } else if (typeof user.wallet === 'object') {
      walletAddress = user.wallet.address || 'N/A';
    }
  }

  return (
    <div style={{ color: 'white', padding: '2rem', maxWidth: 500, margin: '0 auto' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Profile</h2>
      <div style={{ marginBottom: '1rem' }}>
        <strong>Name:</strong> {name}
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <strong>Email:</strong> {email}
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <strong>Wallet Address:</strong> {walletAddress}
      </div>
      <button onClick={logout} style={{ marginTop: '2rem', padding: '0.5rem 1.5rem', fontSize: '1rem', borderRadius: '8px', border: 'none', background: '#fff', color: '#000', cursor: 'pointer' }}>Logout</button>
    </div>
  );
}

export default Profile;
