import React from 'react';

export const Navbar = () => (
  <>
    {/* Navbar */}
    <div className="top">
      <div className="bar theme-d2 small">
        <a href="#" className="bar-item button padding-large theme-d4"><i className="fa fa-home margin-right"></i>Home</a>
        <a href="#" className="bar-item button right padding-large hover-white"><i className="fa fa-user"></i> Account</a>
      </div>
    </div>
  </>
);

export const Footer = () => (
  <footer className="container theme-d3 padding-16">
    <h5>Footer</h5>
  </footer>
);
