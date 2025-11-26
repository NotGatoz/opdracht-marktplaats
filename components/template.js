import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export function Navbar() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setIsAdmin(userData.is_admin);
      } catch (err) {
        console.error('Error parsing user:', err);
      }
    }
  }, []);

  return (
    <div className="top">
        <div className="bar theme-d2" style={{display: 'flex', justifyContent: 'space-between'}}>
        <div>
          <Link href="/" className="bar-item button small padding-small theme-d4"><i className="fa fa-home margin-right"></i>Startpagina</Link>
          <Link href="/opdracht/post" className="bar-item button small padding-small theme-d4"><i className="fa fa-plus margin-right"></i>Opdracht Plaatsen</Link>
          {isAdmin && <Link href="/admin/panel" className="bar-item button small padding-small theme-d4"><i className="fa fa-cog margin-right"></i>Beheer</Link>}
        </div>
        <a href="#" className="bar-item button small hide-small padding-small hover-white"><i className="fa fa-user"></i> Account</a>
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="container theme-d3 padding-16">
      <h5>Voettekst</h5>
    </footer>
  );
}
