import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar, Footer } from '../components/template';

export default function Home() {
  const [userData, setUserData] = useState(null);

  // Fetch current user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUserData(JSON.parse(storedUser));
      } catch (err) {
        console.error('Error parsing stored user:', err);
      }
    }
  }, []);

  return (
    <div className="theme-l5" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <div style={{ flex: 1, display: 'flex' }}>
        {/* Profile Sidebar */}
        <div className="profile-sidebar">
          <div className="card round white">
            <div className="container">
              <h4 className="center">My Profile</h4>
              {userData ? (
                <>
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
                  <p>Email: {userData.email}</p>
                  <p>Joined {new Date(userData.created_at).toLocaleDateString()}</p>
                  <button
                    className="button block theme-l1"
                    onClick={async () => {
                      await fetch('/api/logout', { method: 'POST' });
                      localStorage.removeItem('user');
                      setUserData(null);
                    }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <p className="center">Not logged in</p>
              )}
            </div>
          </div>
          <br />
        </div>

        {/* Page Container */}
        <div className="container content" style={{ marginTop: '80px', marginLeft: '320px' }}>
          <div className="row">
            <Link href="/auth/login">
              <button className="button theme-l1">Login</button>
            </Link>
            <Link href="/auth/register">
              <button className="button theme-l1">Register</button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
