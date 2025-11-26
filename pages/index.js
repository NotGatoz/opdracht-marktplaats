import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Navbar, Footer } from '../components/template';

export default function Home() {
  const [userData, setUserData] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  // Check if logged in, redirect to login if not
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUserData(JSON.parse(storedUser));
        setCheckingAuth(false);
      } catch (err) {
        console.error('Error parsing stored user:', err);
        router.push('/auth/login');
      }
    } else {
      // Not logged in, redirect to login
      router.push('/auth/login');
    }
  }, [router]);

  if (checkingAuth) {
    return (
      <div className="theme-l5" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <p style={{ fontSize: '1.2rem' }}>Bezig met laden...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="theme-l5" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <div style={{ flex: 1, display: 'flex' }}>
        {/* Profile Sidebar */}
        <div className="profile-sidebar">
          <div className="card round white">
            <div className="container">
              <h4 className="center">Mijn Profiel</h4>
              <p className="center">
                <img
                  src="/w3images/avatar3.png"
                  className="circle"
                  style={{ height: '106px', width: '106px' }}
                  alt="Avatar"
                />
              </p>
              <hr />
              <p>ID: {userData.id}</p>
              <p>
                {userData.name} {userData.last_name}
              </p>
              <p>E-mail: {userData.email}</p>
              <p>Lid sinds {new Date(userData.created_at).toLocaleDateString('nl-NL')}</p>
              <button
                className="button block theme-l1"
                onClick={async () => {
                  await fetch('/api/logout', { method: 'POST' });
                  localStorage.removeItem('user');
                  router.push('/auth/login');
                }}
              >
                Uitloggen
              </button>
            </div>
          </div>
          <br />
        </div>

        {/* Page Container */}
        <div className="container content" style={{ marginTop: '80px', marginLeft: '320px' }}>
          <div className="row">
            <h1>Welkom, {userData.name}!</h1>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
