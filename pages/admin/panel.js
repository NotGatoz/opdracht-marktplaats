import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Navbar, Footer } from '../../components/template';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function AdminPanel() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // USER STATS
  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  const [activeTab, setActiveTab] = useState('pending');
  const [actionLoading, setActionLoading] = useState(null);

  // 📊 STATISTIEK DATA (GRAFIEKEN)
  const [statsData, setStatsData] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // -------------------------------------------
  // LOAD USER + STATS
  // -------------------------------------------
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        if (!userData.is_admin) {
          router.push('/');
          return;
        }
      } catch (err) {
        console.error('Error parsing user:', err);
      }
    } else {
      router.push('/auth/login');
      return;
    }

    fetchUsers();
    fetchStats(); // <-- grafieken laden
  }, [router]);

  // -------------------------------------------
  // FETCH STATS API
  // -------------------------------------------
  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      setStatsData(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  // -------------------------------------------
  // FETCH USERS
  // -------------------------------------------
  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data.users || []);

      const allUsers = data.users || [];
      const adminCount = allUsers.filter(u => u.is_admin).length;
      const pendingCount = allUsers.filter(u => u.status === 'pending').length;
      const approvedCount = allUsers.filter(u => u.status === 'approved').length;
      const rejectedCount = allUsers.filter(u => u.status === 'rejected').length;

      setStats({
        total: allUsers.length,
        admins: adminCount,
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
      });
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------
  // USER ACTIONS
  // -------------------------------------------
  const handlePosterRole = async (userId, makePoster) => {
    setActionLoading(userId);
    try {
      const res = await fetch('/api/admin/user-action', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'changePosterRole',
          userId,
          isPoster: makePoster
        }),
      });

      if (!res.ok) throw new Error('Failed to update poster role');
      await fetchUsers();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUserAction = async (userId, action) => {
    setActionLoading(userId);
    try {
      const method = action === 'delete' ? 'DELETE' : 'PATCH';
      const res = await fetch(`/api/admin/user-action?userId=${userId}&action=${action}`, { method });
      if (!res.ok) throw new Error('Action failed');
      await fetchUsers();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const getFilteredUsers = () => {
    if (activeTab === 'pending') return users.filter(u => u.status === 'pending');
    if (activeTab === 'approved') return users.filter(u => u.status === 'approved');
    return users;
  };

  // -------------------------------------------
  // CHART FORMATTING FUNCTIONS
  // -------------------------------------------
  const formatMonth = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString('nl-NL', { month: 'short' });
  };

  const lineChartData = statsData && statsData.opdrachtenOverTime && statsData.bidsOverTime && {
    labels: statsData.opdrachtenOverTime.map(m => formatMonth(m.month)),
    datasets: [
      {
        label: 'Opdrachten',
        data: statsData.opdrachtenOverTime.map(m => m.count),
        borderColor: '#0066cc',
        backgroundColor: 'rgba(0,102,204,0.3)',
        fill: true,
      },
      {
        label: 'Biedingen',
        data: statsData.bidsOverTime.map(m => m.count),
        borderColor: '#51cf66',
        backgroundColor: 'rgba(81,207,102,0.3)',
        fill: true,
      }
    ]
  };

  const pieChartData = statsData && statsData.statusDistribution && {
    labels: statsData.statusDistribution.map(s => s.status),
    datasets: [
      {
        data: statsData.statusDistribution.map(s => s.count),
        backgroundColor: ['#51cf66', '#ff6b6b', '#ffd700', '#0066cc']
      }
    ]
  };

  const barChartData = statsData && statsData.avgBidPerOpdracht && {
    labels: statsData.avgBidPerOpdracht.map(o => o.title),
    datasets: [
      {
        label: 'Gemiddeld Bod (€)',
        data: statsData.avgBidPerOpdracht.map(o => o.avg_amount),
        backgroundColor: '#0066cc'
      }
    ]
  };

  const userRegistrationsChartData = statsData && statsData.userRegistrationsOverTime && {
    labels: statsData.userRegistrationsOverTime.map(m => formatMonth(m.month)),
    datasets: [
      {
        label: 'Nieuwe Gebruikers',
        data: statsData.userRegistrationsOverTime.map(m => m.count),
        borderColor: '#ff6b6b',
        backgroundColor: 'rgba(255,107,107,0.3)',
        fill: true,
      }
    ]
  };

  const userStatusPieChartData = statsData && statsData.userStatusDistribution && {
    labels: statsData.userStatusDistribution.map(s => {
      const statusMap = {
        pending: 'In Afwachting',
        approved: 'Goedgekeurd',
        rejected: 'Afgewezen'
      };
      return statusMap[s.status] || s.status;
    }),
    datasets: [
      {
        data: statsData.userStatusDistribution.map(s => s.count),
        backgroundColor: ['#ff6b6b', '#51cf66', '#ffd700', '#0066cc']
      }
    ]
  };

  const userLoginsChartData = statsData && statsData.userLoginsOverTime && {
    labels: statsData.userLoginsOverTime.map(m => formatMonth(m.month)),
    datasets: [
      {
        label: 'Gebruikers Logins',
        data: statsData.userLoginsOverTime.map(m => m.count),
        borderColor: '#9c88ff',
        backgroundColor: 'rgba(156,136,255,0.3)',
        fill: true,
      }
    ]
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { label: 'In Afwachting', color: '#ffd700', textColor: '#333' },
      approved: { label: 'Goedgekeurd', color: '#51cf66', textColor: 'white' },
      rejected: { label: 'Afgewezen', color: '#ff6b6b', textColor: 'white' },
    };
    const s = statusMap[status] || statusMap.pending;
    return (
      <span
        style={{
          display: 'inline-block',
          padding: '0.4rem 0.8rem',
          borderRadius: '20px',
          fontSize: '0.8rem',
          fontWeight: 'bold',
          backgroundColor: s.color,
          color: s.textColor,
        }}
      >
        {s.label}
      </span>
    );
  };

  // -------------------------------------------
  // LOADING / ACCESS CHECK
  // -------------------------------------------
  if (loading) {
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

  if (!user || !user.is_admin) {
    return (
      <div className="theme-l5" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <p style={{ fontSize: '1.2rem', color: 'red' }}>Access denied. Admin only.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const filteredUsers = getFilteredUsers();

  // -------------------------------------------
  // RENDER
  // -------------------------------------------
  return (
    <div className="theme-l5" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <div style={{ flex: 1, padding: '2rem', maxWidth: '1400px', margin: '80px auto 0', width: '100%' }}>
        {/* Header */}
        <div style={{ marginBottom: '3rem' }}>
          <h1 style={{ margin: 0, fontSize: '3rem', fontWeight: 700, background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Beheerdashboard</h1>
          <p style={{ margin: '0.75rem 0 0 0', color: 'var(--gray-500)', fontSize: '1.05rem' }}>Welkom terug, <strong>{user.name}</strong></p>
        </div>

        {/* USER STAT CARDS */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem'
        }}>
          <div className="card stat-card primary" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--gray-500)', fontWeight: 500 }}>Totaal Gebruikers</p>
              <h2 style={{ margin: '0.75rem 0 0 0', fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary-light)' }}>{stats.total}</h2>
            </div>
            <div style={{ fontSize: '3rem', opacity: 0.2 }}>👥</div>
          </div>

          <div className="card stat-card warning" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--gray-500)', fontWeight: 500 }}>In Afwachting</p>
              <h2 style={{ margin: '0.75rem 0 0 0', fontSize: '2.5rem', fontWeight: 700, color: 'var(--warning)' }}>{stats.pending}</h2>
            </div>
            <div style={{ fontSize: '3rem', opacity: 0.2 }}>⏳</div>
          </div>

          <div className="card stat-card success" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--gray-500)', fontWeight: 500 }}>Goedgekeurd</p>
              <h2 style={{ margin: '0.75rem 0 0 0', fontSize: '2.5rem', fontWeight: 700, color: 'var(--success)' }}>{stats.approved}</h2>
            </div>
            <div style={{ fontSize: '3rem', opacity: 0.2 }}>✓</div>
          </div>

          <div className="card stat-card danger" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--gray-500)', fontWeight: 500 }}>Beheerders</p>
              <h2 style={{ margin: '0.75rem 0 0 0', fontSize: '2.5rem', fontWeight: 700, color: 'var(--danger)' }}>{stats.admins}</h2>
            </div>
            <div style={{ fontSize: '3rem', opacity: 0.2 }}>👑</div>
          </div>
        </div>

        {/* Statistics Graphs */}
        <div
          className="card round white"
          style={{
            padding: '2.5rem',
            marginBottom: '3rem'
          }}
        >
          <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem', fontWeight: 600, color: 'var(--gray-900)' }}>📊 Statistieken Overzicht</h2>

          {statsLoading || !statsData ? (
            <p>Statistieken laden...</p>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '1.5rem'
            }}>
              {/* Pie Chart - User Status */}
              <div className="card round white" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--gray-900)' }}>
                  👤 Gebruikers Status Verdeling
                </h3>
                <div style={{ height: '200px', display: 'flex', justifyContent: 'center' }}>
                  <Pie data={userStatusPieChartData} options={{ maintainAspectRatio: false }} />
                </div>
              </div>

              {/* Line Chart - User Registrations */}
              <div className="card round white" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--gray-900)' }}>
                  📈 Gebruikersregistraties per maand
                </h3>
                <div style={{ height: '200px' }}>
                  <Line data={userRegistrationsChartData} options={{ maintainAspectRatio: false }} />
                </div>
              </div>

              {/* Line Chart - User Logins */}
              <div className="card round white" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--gray-900)' }}>
                  🔐 Gebruikers Logins per maand
                </h3>
                <div style={{ height: '200px' }}>
                  <Line data={userLoginsChartData} options={{ maintainAspectRatio: false }} />
                </div>
              </div>

              {/* Pie Chart - Opdracht Status */}
              <div className="card round white" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--gray-900)' }}>
                  🎯 Opdracht Status Verdeling
                </h3>
                <div style={{ height: '200px', display: 'flex', justifyContent: 'center' }}>
                  <Pie data={pieChartData} options={{ maintainAspectRatio: false }} />
                </div>
              </div>

              {/* Line Chart - Opdrachten & biedingen */}
              <div className="card round white" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--gray-900)' }}>
                  💰 Opdrachten & biedingen per maand
                </h3>
                <div style={{ height: '200px' }}>
                  <Line data={lineChartData} options={{ maintainAspectRatio: false }} />
                </div>
              </div>

              {/* Bar Chart - Top Opdrachten */}
              <div className="card round white" style={{ padding: '1.5rem', gridColumn: 'span 1' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--gray-900)' }}>
                  🏆 Top 10 Opdrachten met Hoogste Gemiddelde Bieding
                </h3>
                <div style={{ height: '250px' }}>
                  <Bar data={barChartData} options={{ maintainAspectRatio: false }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* USER MANAGEMENT */}
        <div className="card round white" style={{
          padding: '2.5rem'
        }}>
          <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem', fontWeight: 600, color: 'var(--gray-900)' }}>👥 Gebruikersbeheer</h2>
          
          {/* Tabs */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '2rem',
            borderBottom: '2px solid var(--gray-200)',
            paddingBottom: 0
          }}>
            <button
              onClick={() => setActiveTab('pending')}
              style={{
                padding: '1rem 1.5rem',
                border: 'none',
                backgroundColor: 'transparent',
                borderBottom: activeTab === 'pending' ? '3px solid var(--warning)' : 'none',
                color: activeTab === 'pending' ? 'var(--warning)' : 'var(--gray-500)',
                cursor: 'pointer',
                fontWeight: activeTab === 'pending' ? 600 : 500,
                fontSize: '0.95rem',
                transition: 'all 0.3s ease'
              }}
            >
              ⏳ In Afwachting <span style={{ fontWeight: 700 }}>({stats.pending})</span>
            </button>

            <button
              onClick={() => setActiveTab('approved')}
              style={{
                padding: '1rem 1.5rem',
                border: 'none',
                backgroundColor: 'transparent',
                borderBottom: activeTab === 'approved' ? '3px solid var(--success)' : 'none',
                color: activeTab === 'approved' ? 'var(--success)' : 'var(--gray-500)',
                cursor: 'pointer',
                fontWeight: activeTab === 'approved' ? 600 : 500,
                fontSize: '0.95rem',
                transition: 'all 0.3s ease'
              }}
            >
              ✅ Goedgekeurd <span style={{ fontWeight: 700 }}>({stats.approved})</span>
            </button>

            <button
              onClick={() => setActiveTab('all')}
              style={{
                padding: '1rem 1.5rem',
                border: 'none',
                backgroundColor: 'transparent',
                borderBottom: activeTab === 'all' ? '3px solid var(--primary-light)' : 'none',
                color: activeTab === 'all' ? 'var(--primary-light)' : 'var(--gray-500)',
                cursor: 'pointer',
                fontWeight: activeTab === 'all' ? 600 : 500,
                fontSize: '0.95rem',
                transition: 'all 0.3s ease'
              }}
            >
              👥 Alle Gebruikers <span style={{ fontWeight: 700 }}>({stats.total})</span>
            </button>
          </div>

          {/* TABLE */}
          {filteredUsers.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>
              Geen gebruikers gevonden.
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--primary-light)', backgroundColor: 'var(--gray-100)' }}>
                    <th style={{ padding: '1.25rem', fontWeight: 700, color: 'var(--gray-700)', textAlign: 'left' }}>Naam</th>
                    <th style={{ padding: '1.25rem', fontWeight: 700, color: 'var(--gray-700)', textAlign: 'left' }}>E-mail</th>
                    <th style={{ padding: '1.25rem', fontWeight: 700, color: 'var(--gray-700)', textAlign: 'center' }}>Status</th>
                    <th style={{ padding: '1.25rem', fontWeight: 700, color: 'var(--gray-700)', textAlign: 'center' }}>Rol</th>
                    <th style={{ padding: '1.25rem', fontWeight: 700, color: 'var(--gray-700)', textAlign: 'center' }}>Lid sinds</th>
                    <th style={{ padding: '1.25rem', fontWeight: 700, color: 'var(--gray-700)', textAlign: 'center' }}>Acties</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((u, idx) => (
                    <tr
                      key={u.id}
                      style={{
                        borderBottom: '1px solid var(--gray-200)',
                        backgroundColor: idx % 2 === 0 ? '#fff' : 'var(--gray-100)',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? 'var(--gray-100)' : 'var(--gray-200)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#fff' : 'var(--gray-100)'}
                    >
                      <td style={{ padding: '1rem' }}>
                        <strong>{u.name} {u.last_name}</strong>
                      </td>

                      <td style={{ padding: '1rem', color: 'var(--primary-light)', fontWeight: 500 }}>{u.email}</td>

                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        {getStatusBadge(u.status)}
                      </td>

                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <span
                          style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '24px',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            backgroundColor: u.is_admin ? 'var(--danger)' : 'var(--success)',
                            color: 'white',
                          }}
                        >
                          {u.is_admin ? '👑 Beheerder' : '👤 Gebruiker'}
                        </span>
                      </td>

                      <td style={{
                        padding: '1rem',
                        textAlign: 'center',
                        color: '#999',
                        fontSize: '0.9rem'
                      }}>
                        {new Date(u.created_at).toLocaleDateString('nl-NL')}
                      </td>

                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <div style={{
                          display: 'flex',
                          gap: '0.5rem',
                          justifyContent: 'center',
                          flexWrap: 'wrap'
                        }}>
                          {u.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleUserAction(u.id, 'approve')}
                                disabled={actionLoading === u.id}
                                style={{
                                  padding: '0.5rem 1rem',
                                  backgroundColor: 'var(--success)',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontWeight: 600,
                                  fontSize: '0.85rem',
                                  cursor: 'pointer',
                                  transition: 'var(--transition)',
                                  opacity: actionLoading === u.id ? 0.6 : 1
                                }}
                                onMouseEnter={(e) => !actionLoading && (e.target.style.transform = 'translateY(-2px)', e.target.style.boxShadow = 'var(--shadow-md)')}
                                onMouseLeave={(e) => (e.target.style.transform = 'translateY(0)', e.target.style.boxShadow = 'none')}
                              >
                                ✓ Goedkeuren
                              </button>

                              <button
                                onClick={() => handleUserAction(u.id, 'reject')}
                                disabled={actionLoading === u.id}
                                style={{
                                  padding: '0.5rem 1rem',
                                  backgroundColor: 'var(--danger)',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontWeight: 600,
                                  fontSize: '0.85rem',
                                  cursor: 'pointer',
                                  transition: 'var(--transition)',
                                  opacity: actionLoading === u.id ? 0.6 : 1
                                }}
                                onMouseEnter={(e) => !actionLoading && (e.target.style.transform = 'translateY(-2px)', e.target.style.boxShadow = 'var(--shadow-md)')}
                                onMouseLeave={(e) => (e.target.style.transform = 'translateY(0)', e.target.style.boxShadow = 'none')}
                              >
                                ✗ Afwijzen
                              </button>
                            </>
                          )}

                          {u.status === 'approved' && (
                            <button
                              onClick={() => handlePosterRole(u.id, !u.is_poster)}
                              disabled={actionLoading === u.id}
                              style={{
                                padding: '0.5rem 1rem',
                                border: '2px solid var(--primary-light)',
                                borderRadius: '6px',
                                backgroundColor: u.is_poster ? 'var(--success)' : 'transparent',
                                color: u.is_poster ? 'white' : 'var(--primary-light)',
                                fontWeight: 600,
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                transition: 'var(--transition)',
                                opacity: actionLoading === u.id ? 0.6 : 1
                              }}
                              onMouseEnter={(e) => !actionLoading && (e.target.style.transform = 'translateY(-2px)', e.target.style.boxShadow = 'var(--shadow-md)')}
                              onMouseLeave={(e) => (e.target.style.transform = 'translateY(0)', e.target.style.boxShadow = 'none')}
                            >
                              {u.is_poster ? '✓ Poster' : '+ Poster'}
                            </button>
                          )}

                          <button
                            onClick={() => handleUserAction(u.id, 'toggle-admin')}
                            disabled={actionLoading === u.id}
                            style={{
                              padding: '0.5rem 1rem',
                              border: '2px solid var(--danger)',
                              borderRadius: '6px',
                              backgroundColor: 'transparent',
                              color: 'var(--danger)',
                              fontWeight: 600,
                              fontSize: '0.85rem',
                              cursor: 'pointer',
                              transition: 'var(--transition)',
                              opacity: actionLoading === u.id ? 0.6 : 1
                            }}
                            onMouseEnter={(e) => !actionLoading && (e.target.style.transform = 'translateY(-2px)', e.target.style.boxShadow = 'var(--shadow-md)')}
                            onMouseLeave={(e) => (e.target.style.transform = 'translateY(0)', e.target.style.boxShadow = 'none')}
                          >
                            {u.is_admin ? '👤' : '👑'}
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Verwijder ${u.name}? Dit kan niet ongedaan gemaakt worden.`)) {
                                handleUserAction(u.id, 'delete');
                              }
                            }}
                            disabled={actionLoading === u.id}
                            style={{
                              padding: '0.5rem 1rem',
                              backgroundColor: 'var(--gray-400)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontWeight: 600,
                              fontSize: '0.85rem',
                              cursor: 'pointer',
                              transition: 'var(--transition)',
                              opacity: actionLoading === u.id ? 0.6 : 1
                            }}
                            onMouseEnter={(e) => !actionLoading && (e.target.style.transform = 'translateY(-2px)', e.target.style.boxShadow = 'var(--shadow-md)')}
                            onMouseLeave={(e) => (e.target.style.transform = 'translateY(0)', e.target.style.boxShadow = 'none')}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      <Footer />
    </div>
  );
}
