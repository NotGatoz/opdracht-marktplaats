import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Navbar, Footer } from '../components/template';
import Link from 'next/link';

export default function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [stats, setStats] = useState({
    totalOpdrachten: 0,
    completedOpdrachten: 0,
    upcomingOpdrachten: [],
  });
  const [recentOpdrachten, setRecentOpdrachten] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [isPoster, setIsPoster] = useState(false);
  const router = useRouter();

useEffect(() => {
  const storedUser = localStorage.getItem('user');

  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser);

      // --------------------------------------------------
      // 🔍 Set is_poster → true or null
      // --------------------------------------------------
      if (parsed.is_poster === true) {
        parsed.is_poster = true;
      } else {
        parsed.is_poster = null;
      }
      // --------------------------------------------------

      setUserData(parsed);
      setCheckingAuth(false);
    } catch (err) {
      console.error('Error parsing stored user:', err);
      router.push('/auth/login');
    }
  } else {
    router.push('/auth/login');
  }
}, [router]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchStats = async () => {
      if (!userData) return;

      try {
        const res = await fetch(`/api/dashboard?userId=${userData.id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Fout bij ophalen dashboard data');

        setStats({
          totalOpdrachten: data.totalOpdrachten,
          completedOpdrachten: data.completedOpdrachten,
          upcomingOpdrachten: data.upcomingOpdrachten,
        });

        setRecentOpdrachten(data.recentOpdrachten || []);
        setIsPoster(data.isPoster || false);
      } catch (err) {
        console.error('Dashboard fetch error:', err.message);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [userData]);

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

        {/* Dashboard Content */}
        <div className="container content" style={{ marginTop: '20px', marginLeft: '320px', flex: 1 }}>
          <h1>Welkom, {userData.name}!</h1>
          <Link href="/opdracht/aangenomen-opdrachten" className="button theme-d4" style={{ float: 'right' }}>
            aangenomen/geboden opdrachten
          </Link>

          {/* Stats */}
          {loadingStats ? (
            <p>Laden...</p>
          ) : (
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
              <div className="card round white" style={{ flex: 1, minWidth: '200px', padding: '1rem' }}>
                <h3>Totaal opdrachten</h3>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.totalOpdrachten}</p>
              </div>
              <div className="card round white" style={{ flex: 1, minWidth: '200px', padding: '1rem' }}>
                <h3>Voltooide opdrachten</h3>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.completedOpdrachten}</p>
              </div>
            </div>
          )}


        </div>
      </div>

      <Footer />
    </div>
  );
}
