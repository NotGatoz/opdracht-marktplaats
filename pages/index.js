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
            </div>
          </div>
          <br />
        </div>

        {/* Dashboard Content */}
        <div className="container content" style={{ marginTop: '20px', marginLeft: '320px', flex: 1 }}>
          {/* Top Row: Welcome Banner and Quick Actions */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', alignItems: 'stretch' }}>
            {/* Welcome Banner */}
            <div className="card round white" style={{ background: 'linear-gradient(135deg, #009688 0%, #00796b 100%)', color: 'white', padding: '1.5rem', flex: '2' }}>
              <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1.8rem' }}>Welkom terug, {userData.name}!</h1>
              <p style={{ margin: '0', fontSize: '1rem' }}>Hier is een overzicht van uw opdrachten en activiteiten.</p>
              <div style={{ marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', opacity: '0.9' }}>
                  <i className="fa fa-calendar"></i> {new Date().toLocaleDateString('nl-NL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card round white" style={{ padding: '1.5rem', flex: '1' }}>
              <h3 style={{ marginTop: '0' }}><i className="fa fa-bolt"></i> Snelle acties</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link href="/opdracht/post" className="button theme-d4" style={{ width: '100%', textAlign: 'center' }}>
                  <i className="fa fa-plus"></i> Nieuwe opdracht
                </Link>
                <Link href="/opdracht/opdrachten" className="button theme-d4" style={{ width: '100%', textAlign: 'center' }}>
                  <i className="fa fa-search"></i> Alle opdrachten
                </Link>
                <Link href="/opdracht/mijn-opdrachten" className="button theme-d4" style={{ width: '100%', textAlign: 'center' }}>
                  <i className="fa fa-user"></i> Mijn opdrachten
                </Link>
                <Link href="/opdracht/aangenomen-opdrachten" className="button theme-d4" style={{ width: '100%', textAlign: 'center' }}>
                  <i className="fa fa-handshake-o"></i> Geboden opdrachten
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          {loadingStats ? (
            <div className="card round white" style={{ padding: '2rem', textAlign: 'center' }}>
              <p>Laden...</p>
            </div>
          ) : (
            <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
              <div className="card round white" style={{ padding: '1rem' }}>
                <h3><i className="fa fa-list"></i> Totaal opdrachten</h3>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.totalOpdrachten}</p>
              </div>
              <div className="card round white" style={{ padding: '1rem' }}>
                <h3><i className="fa fa-check"></i> Voltooide opdrachten</h3>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.completedOpdrachten}</p>
              </div>
              <div className="card round white" style={{ padding: '1rem' }}>
                <h3><i className="fa fa-clock-o"></i> Lopende opdrachten</h3>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.totalOpdrachten - stats.completedOpdrachten}</p>
              </div>
              <div className="card round white" style={{ padding: '1rem' }}>
                <h3><i className="fa fa-calendar"></i> Aankomende opdrachten</h3>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.upcomingOpdrachten.length}</p>
              </div>
            </div>
          )}

          {/* Middle Row: Analytics and Status */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            {/* Quick Stats */}
            <div className="card round white" style={{ padding: '1rem', flex: '1' }}>
              <h3><i className="fa fa-chart-line"></i> Prestatie overzicht</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Voltooiingspercentage:</span>
                  <span style={{ fontWeight: 'bold' }}>
                    {stats.totalOpdrachten > 0 ? Math.round((stats.completedOpdrachten / stats.totalOpdrachten) * 100) : 0}%
                  </span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#eee', borderRadius: '4px' }}>
                  <div style={{
                    width: `${stats.totalOpdrachten > 0 ? (stats.completedOpdrachten / stats.totalOpdrachten) * 100 : 0}%`,
                    height: '100%',
                    backgroundColor: '#4caf50',
                    borderRadius: '4px'
                  }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#666' }}>
                  <span>Gemiddelde per maand:</span>
                  <span>{Math.round(stats.totalOpdrachten / 12)}</span>
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="card round white" style={{ padding: '1rem', flex: '1' }}>
              <h3><i className="fa fa-server"></i> Systeem status</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <i className="fa fa-circle" style={{ color: '#4caf50' }}></i>
                  <span>Database: Online</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <i className="fa fa-circle" style={{ color: '#4caf50' }}></i>
                  <span>API: Operationeel</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <i className="fa fa-circle" style={{ color: '#ff9800' }}></i>
                  <span>Backups: Gepland</span>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="card round white" style={{ padding: '1rem', flex: '2' }}>
              <h3><i className="fa fa-bell"></i> Meldingen</h3>
              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
                <div style={{ padding: '0.5rem', backgroundColor: '#e8f5e8', borderRadius: '4px', borderLeft: '4px solid #4caf50', minWidth: '200px' }}>
                  <i className="fa fa-check-circle" style={{ color: '#4caf50' }}></i> Welkom bij het nieuwe dashboard!
                </div>
                <div style={{ padding: '0.5rem', backgroundColor: '#fff3e0', borderRadius: '4px', borderLeft: '4px solid #ff9800', minWidth: '200px' }}>
                  <i className="fa fa-exclamation-triangle" style={{ color: '#ff9800' }}></i> Controleer uw lopende opdrachten
                </div>
                <div style={{ padding: '0.5rem', backgroundColor: '#fce4ec', borderRadius: '4px', borderLeft: '4px solid #e91e63', minWidth: '200px' }}>
                  <i className="fa fa-info-circle" style={{ color: '#e91e63' }}></i> Nieuwe functies beschikbaar
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row: Activities and Tasks */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            {/* Recent Activities */}
            <div className="recent-activities card round white" style={{ padding: '1rem', flex: '1' }}>
              <h3><i className="fa fa-history"></i> Recente activiteiten</h3>
              {recentOpdrachten.length > 0 ? (
                <ul>
                  {recentOpdrachten.slice(0, 5).map((opdracht, index) => (
                    <li key={index}>
                      <strong>{opdracht.title}</strong> - {new Date(opdracht.created_at).toLocaleDateString('nl-NL')}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Geen recente opdrachten.</p>
              )}
            </div>

            {/* Upcoming Tasks */}
            <div className="card round white" style={{ padding: '1rem', flex: '1' }}>
              <h3><i className="fa fa-calendar-check-o"></i> Aankomende taken</h3>
              {stats.upcomingOpdrachten.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {stats.upcomingOpdrachten.slice(0, 3).map((opdracht, index) => (
                    <div key={index} style={{ padding: '0.5rem', border: '1px solid #eee', borderRadius: '4px' }}>
                      <strong>{opdracht.title}</strong>
                      <br />
                      <small style={{ color: '#666' }}>
                        Deadline: {new Date(opdracht.deadline || opdracht.created_at).toLocaleDateString('nl-NL')}
                      </small>
                    </div>
                  ))}
                </div>
              ) : (
                <p>Geen aankomende taken.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
