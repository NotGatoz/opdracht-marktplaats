 import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export function Navbar() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (err) {
        console.error('Error parsing user:', err);
      }
    }
  }, []);

  const showMijnOpdrachten = user && (user.is_admin || user.is_poster);

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    localStorage.removeItem('user');
    router.push('/auth/login');
  };

  return (
    <div className="top">
      <div className="bar theme-d2" style={{ display: 'flex', justifyContent: 'space-between' }}>
        
        {/* LEFT SIDE */}
        <div>
          <Link href="/" className="bar-item button small padding-small theme-d4">
            <i className="fa fa-home margin-right"></i>Startpagina
          </Link>

          {showMijnOpdrachten && (
            <Link href="/opdracht/mijn-opdrachten" className="bar-item button small padding-small theme-d4">
              <i className="fa fa-list-alt margin-right"></i>Mijn Geplaatste Opdrachten
            </Link>
          )}

          <Link href="/opdracht/post" className="bar-item button small padding-small theme-d4">
            <i className="fa fa-plus margin-right"></i>Opdracht Plaatsen
          </Link>

          <Link href="/opdracht/opdrachten" className="bar-item button small padding-small theme-d4">
            <i className="fa fa-list margin-right"></i>Opdrachten
          </Link>

          {user?.is_admin && (
            <Link href="/admin/panel" className="bar-item button small padding-small theme-d4">
              <i className="fa fa-cog margin-right"></i>Beheer
            </Link>
          )}
        </div>

        {/* RIGHT SIDE */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <a href="#" className="bar-item button small hide-small padding-small hover-white">
            <i className="fa fa-user margin-right"></i> Account
          </a>

          {/* LOGOUT BUTTON */}
          {user && (
            <button
              onClick={handleLogout}
              className="bar-item button small padding-small theme-d4"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <i className="fa fa-sign-out"></i>
              Uitloggen
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="container theme-d3 padding-16">
      <h5>Avontuur</h5>
    </footer>
  );
}
