import React from 'react';
import Link from 'next/link';

export function Navbar() {
  return (
    <div className="top">
      <div className="bar theme-d2" style={{display: 'flex', justifyContent: 'space-between'}}>
        <Link href="/" className="bar-item button small padding-small theme-d4"><i className="fa fa-home margin-right"></i>Home</Link>
        <a href="#" className="bar-item button small hide-small padding-small hover-white"><i className="fa fa-user"></i> Account</a>
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="container theme-d3 padding-16">
      <h5>Footer</h5>
    </footer>
  );
}
