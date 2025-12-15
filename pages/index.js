import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Navbar, Footer } from '../components/template';
import Link from 'next/link';

export default function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
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

      // Load profile photo
      if (parsed.id) {
        fetch(`/api/get-profile-photo?userId=${parsed.id}`)
          .then(res => {
            if (res.ok) {
              return res.blob();
            }
          })
          .then(blob => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              setProfilePhoto(url);
            }
          })
          .catch(err => console.error('Error loading profile photo:', err));
      }
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

      <div style={{ flex: 1, display: 'flex', marginTop: '80px' }}>
        {/* Profile Sidebar */}
        <div className="profile-sidebar" style={{ top: '80px' }}>
          <div className="card round white">
            <div className="container">
              <h4 className="center">Mijn Profiel</h4>
              <p className="center">
                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    className="circle"
                    style={{ height: '106px', width: '106px', objectFit: 'cover', border: '3px solid #ddd' }}
                    alt="Profielfoto"
                  />
                ) : (
                  <img
                    src="/w3images/avatar3.png"
                    className="circle"
                    style={{ height: '106px', width: '106px' }}
                    alt="Avatar"
                  />
                )}
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
          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2.5rem', alignItems: 'stretch' }}>
            {/* Welcome Banner */}
            <div className="card round white" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', color: 'white', padding: '2rem', flex: '2' }}>
              <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', fontWeight: 700 }}>👋 Welkom terug, <br />{userData.name}!</h1>
              <p style={{ margin: '0.75rem 0 0 0', fontSize: '1.05rem', opacity: 0.95 }}>Hier is een overzicht van uw opdrachten en activiteiten.</p>
              <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.9 }}>
                <i className="fa fa-calendar" style={{ fontSize: '0.95rem' }}></i>
                <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{new Date().toLocaleDateString('nl-NL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card round white" style={{ padding: '2rem', flex: '1', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ marginTop: '0', marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 600, color: 'var(--gray-900)' }}>⚡ Snelle acties</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Link href="/opdracht/post" className="button theme-d4" style={{ width: '100%', textAlign: 'center', padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}>
                  <i className="fa fa-plus" style={{ marginRight: '0.5rem' }}></i>Nieuwe opdracht
                </Link>
                <Link href="/opdracht/opdrachten" className="button theme-d4" style={{ width: '100%', textAlign: 'center', padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}>
                  <i className="fa fa-search" style={{ marginRight: '0.5rem' }}></i>Alle opdrachten
                </Link>
                <Link href="/opdracht/mijn-opdrachten" className="button theme-d4" style={{ width: '100%', textAlign: 'center', padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}>
                  <i className="fa fa-user" style={{ marginRight: '0.5rem' }}></i>Mijn opdrachten
                </Link>
                <Link href="/opdracht/aangenomen-opdrachten" className="button theme-d4" style={{ width: '100%', textAlign: 'center', padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}>
                  <i className="fa fa-handshake-o" style={{ marginRight: '0.5rem' }}></i>Geboden opdrachten
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          {loadingStats ? (
            <div className="card round white" style={{ padding: '2rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--gray-500)' }}>Laden...</p>
            </div>
          ) : (
            <div className="dashboard-grid" style={{ marginBottom: '2.5rem' }}>
              <div className="card stat-card primary">
                <h3 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--gray-500)', fontWeight: 500 }}>📋 Totaal opdrachten</h3>
                <p style={{ fontSize: '2.5rem', fontWeight: 700, margin: '0.75rem 0 0 0', color: 'var(--primary-light)' }}>{stats.totalOpdrachten}</p>
              </div>
              <div className="card stat-card success">
                <h3 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--gray-500)', fontWeight: 500 }}>✓ Voltooide opdrachten</h3>
                <p style={{ fontSize: '2.5rem', fontWeight: 700, margin: '0.75rem 0 0 0', color: 'var(--success)' }}>{stats.completedOpdrachten}</p>
              </div>
              <div className="card stat-card warning">
                <h3 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--gray-500)', fontWeight: 500 }}>⏳ Lopende opdrachten</h3>
                <p style={{ fontSize: '2.5rem', fontWeight: 700, margin: '0.75rem 0 0 0', color: 'var(--warning)' }}>{stats.totalOpdrachten - stats.completedOpdrachten}</p>
              </div>
              <div className="card stat-card danger">
                <h3 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--gray-500)', fontWeight: 500 }}>📅 Aankomende opdrachten</h3>
                <p style={{ fontSize: '2.5rem', fontWeight: 700, margin: '0.75rem 0 0 0', color: 'var(--danger)' }}>{stats.upcomingOpdrachten.length}</p>
              </div>
            </div>
          )}

          {/* Middle Row: Analytics and Status */}
          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2.5rem' }}>
            {/* Quick Stats */}
            <div className="card round white" style={{ padding: '1.5rem', flex: '1' }}>
              <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 600, color: 'var(--gray-900)' }}>📊 Prestatie overzicht</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--gray-700)' }}>Voltooiingspercentage</span>
                    <span style={{ fontWeight: 700, color: 'var(--primary-light)' }}>
                      {stats.totalOpdrachten > 0 ? Math.round((stats.completedOpdrachten / stats.totalOpdrachten) * 100) : 0}%
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--gray-200)', borderRadius: '12px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${stats.totalOpdrachten > 0 ? (stats.completedOpdrachten / stats.totalOpdrachten) * 100 : 0}%`,
                      height: '100%',
                      backgroundColor: 'var(--success)',
                      borderRadius: '12px',
                      transition: 'width 0.5s ease'
                    }}></div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--gray-100)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.95rem', color: 'var(--gray-700)' }}>Gemiddelde per maand:</span>
                  <span style={{ fontWeight: 700, color: 'var(--primary-light)' }}>{Math.round(stats.totalOpdrachten / 12)}</span>
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="card round white" style={{ padding: '1.5rem', flex: '1' }}>
              <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 600, color: 'var(--gray-900)' }}>🔧 Systeem status</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', backgroundColor: 'var(--gray-100)', borderRadius: '8px' }}>
                  <i className="fa fa-circle" style={{ color: 'var(--success)', fontSize: '0.6rem' }}></i>
                  <span style={{ fontSize: '0.95rem', color: 'var(--gray-700)' }}>Database: Online</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', backgroundColor: 'var(--gray-100)', borderRadius: '8px' }}>
                  <i className="fa fa-circle" style={{ color: 'var(--success)', fontSize: '0.6rem' }}></i>
                  <span style={{ fontSize: '0.95rem', color: 'var(--gray-700)' }}>API: Operationeel</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', backgroundColor: 'var(--gray-100)', borderRadius: '8px' }}>
                  <i className="fa fa-circle" style={{ color: 'var(--warning)', fontSize: '0.6rem' }}></i>
                  <span style={{ fontSize: '0.95rem', color: 'var(--gray-700)' }}>Backups: Gepland</span>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="card round white" style={{ padding: '1.5rem', flex: '2' }}>
              <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 600, color: 'var(--gray-900)' }}>🔔 Meldingen</h3>
              <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                <div style={{ padding: '1rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', borderLeft: '4px solid var(--success)', minWidth: '220px' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <i className="fa fa-check-circle" style={{ color: 'var(--success)', fontSize: '1.1rem' }}></i>
                    <span style={{ fontSize: '0.9rem', color: 'var(--gray-800)' }}>Welkom bij het nieuwe dashboard!</span>
                  </div>
                </div>
                <div style={{ padding: '1rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px', borderLeft: '4px solid var(--warning)', minWidth: '220px' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <i className="fa fa-exclamation-triangle" style={{ color: 'var(--warning)', fontSize: '1.1rem' }}></i>
                    <span style={{ fontSize: '0.9rem', color: 'var(--gray-800)' }}>Controleer uw lopende opdrachten</span>
                  </div>
                </div>
                <div style={{ padding: '1rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', borderLeft: '4px solid var(--primary-light)', minWidth: '220px' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <i className="fa fa-info-circle" style={{ color: 'var(--primary-light)', fontSize: '1.1rem' }}></i>
                    <span style={{ fontSize: '0.9rem', color: 'var(--gray-800)' }}>Nieuwe functies beschikbaar</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row: Activities and Tasks */}
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {/* Recent Activities */}
            <div className="recent-activities card round white" style={{ padding: '1.5rem', flex: '1' }}>
              <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 600, color: 'var(--gray-900)' }}>📜 Recente activiteiten</h3>
              {recentOpdrachten.length > 0 ? (
                <ul style={{ margin: 0, paddingLeft: 0 }}>
                  {recentOpdrachten.slice(0, 5).map((opdracht, index) => (
                    <li key={index} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ color: 'var(--gray-900)', fontSize: '0.95rem' }}>{opdracht.title}</strong>
                      <span style={{ fontSize: '0.85rem', color: 'var(--gray-500)', whiteSpace: 'nowrap', marginLeft: '0.5rem' }}>{new Date(opdracht.created_at).toLocaleDateString('nl-NL')}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: 'var(--gray-500)', fontStyle: 'italic' }}>Geen recente opdrachten.</p>
              )}
            </div>

            {/* Upcoming Tasks */}
            <div className="card round white" style={{ padding: '1.5rem', flex: '1' }}>
              <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 600, color: 'var(--gray-900)' }}>📅 Aankomende taken</h3>
              {stats.upcomingOpdrachten.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {stats.upcomingOpdrachten.slice(0, 3).map((opdracht, index) => (
                    <div key={index} style={{ padding: '1rem', border: '1px solid var(--gray-200)', borderRadius: '8px', backgroundColor: 'var(--gray-100)', transition: 'all 0.2s ease' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--gray-200)'; e.currentTarget.style.transform = 'translateX(4px)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--gray-100)'; e.currentTarget.style.transform = 'translateX(0)'; }}>
                      <strong style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--gray-900)' }}>{opdracht.title}</strong>
                      <small style={{ color: 'var(--gray-500)' }}>
                        📍 Deadline: {new Date(opdracht.deadline || opdracht.created_at).toLocaleDateString('nl-NL')}
                      </small>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--gray-500)', fontStyle: 'italic' }}>Geen aankomende taken.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
