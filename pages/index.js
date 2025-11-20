import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar, Footer } from '../components/template';
import { supabase } from '../utils/supabase';

export default function Home() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('getSession session:', session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        console.log('getSession userData:', data, 'error:', error);
        if (!error) {
          setUserData(data);
        }
      }
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('onAuthStateChange session:', session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        console.log('onAuthStateChange userData:', data, 'error:', error);
        if (!error) {
          setUserData(data);
        }
      } else {
        setUserData(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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
              {userData ? (
                <>
                  <p className="center"><img src="/w3images/avatar3.png" className="circle" style={{height: '106px', width: '106px'}} alt="Avatar" /></p>
                  <hr />
                  <p><i className="fa fa-id-card fa-fw margin-right text-theme"></i> ID: {userData.id}</p>
                  <p><i className="fa fa-user fa-fw margin-right text-theme"></i> {userData.name} {userData.last_name}</p>
                  <p><i className="fa fa-envelope fa-fw margin-right text-theme"></i> {userData.email}</p>
                  <p><i className="fa fa-calendar fa-fw margin-right text-theme"></i> Joined {new Date(userData.created_at).toLocaleDateString()}</p>
                  <button className="button block theme-l1" onClick={() => supabase.auth.signOut()}>Logout</button>
                </>
              ) : null}
            </div>
          </div>
          <br />
        </div>

        {/* Page Container */}
        <div className="container content" style={{marginTop: '80px', marginLeft: '320px'}}>
          {/* The Grid */}
          <div className="row">
            {/* Main Content */}
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
