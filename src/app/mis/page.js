'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function MISPage() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('current_user');
    router.push('/');
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>IT (MIS) Dashboard</h1>
      <p>Welcome to the MIS Dashboard.</p>
      <button 
        onClick={handleLogout}
        style={{ marginTop: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
      >
        Log Out
      </button>
    </div>
  );
}