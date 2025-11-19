import React from 'react';
import { Navbar, Footer } from '../components/template';

export default function Home() {
  return (
    <div className="theme-l5" style={{display: 'flex', flexDirection: 'column', minHeight: '100vh'}}>
      <Navbar />

      {/* Main Content Wrapper */}
      <div style={{flex: 1, display: 'flex'}}>
        {/* Profile Sidebar */}
        <div className="profile-sidebar">
          <div className="card round white">
            <div className="container">
              <h4 className="center">My Profile</h4>
              <p className="center"><img src="/w3images/avatar3.png" className="circle" style={{height: '106px', width: '106px'}} alt="Avatar" /></p>
              <hr />
              <p><i className="fa fa-pencil fa-fw margin-right text-theme"></i> Designer, UI</p>
              <p><i className="fa fa-home fa-fw margin-right text-theme"></i> London, UK</p>
              <p><i className="fa fa-birthday-cake fa-fw margin-right text-theme"></i> April 1, 1988</p>
            </div>
          </div>
          <br />
        </div>

        {/* Page Container */}
        <div className="container content" style={{marginTop: '80px', marginLeft: '320px'}}>
          {/* The Grid */}
          <div className="row">
            {/* Main Content */}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
