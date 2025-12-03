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

  const lineChartData = statsData && {
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
        label: 'Bids',
        data: statsData.bidsOverTime.map(m => m.count),
        borderColor: '#51cf66',
        backgroundColor: 'rgba(81,207,102,0.3)',
        fill: true,
      }
    ]
  };

  const pieChartData = statsData && {
    labels: statsData.statusDistribution.map(s => s.status),
    datasets: [
      {
        data: statsData.statusDistribution.map(s => s.count),
        backgroundColor: ['#51cf66', '#ff6b6b', '#ffd700', '#0066cc']
      }
    ]
  };

  const barChartData = statsData && {
    labels: statsData.avgBidPerOpdracht.map(o => o.title),
    datasets: [
      {
        label: 'Gemiddeld Bod (€)',
        data: statsData.avgBidPerOpdracht.map(o => o.avg_amount),
        backgroundColor: '#0066cc'
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

      <div style={{ flex: 1, padding: '2rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ margin: 0, fontSize: '2.5rem', color: '#333' }}>Beheerdashboard</h1>
          <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>Welkom terug, {user.name}</p>
        </div>

        {/* USER STAT CARDS */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div className="card round white" style={{ padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#999' }}>Totaal Gebruikers</p>
            <h2 style={{ margin: '0.5rem 0', fontSize: '2rem', color: '#0066cc' }}>{stats.total}</h2>
          </div>

          <div className="card round white" style={{ padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#999' }}>In Afwachting</p>
            <h2 style={{ margin: '0.5rem 0', fontSize: '2rem', color: '#ffd700' }}>{stats.pending}</h2>
          </div>

          <div className="card round white" style={{ padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#999' }}>Goedgekeurd</p>
            <h2 style={{ margin: '0.5rem 0', fontSize: '2rem', color: '#51cf66' }}>{stats.approved}</h2>
          </div>

          <div className="card round white" style={{ padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#999' }}>Beheerders</p>
            <h2 style={{ margin: '0.5rem 0', fontSize: '2rem', color: '#ff6b6b' }}>{stats.admins}</h2>
          </div>
        </div>

        {/* Statistics Graphs */}
        <div
          className="card round white"
          style={{
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          <h2 style={{ marginBottom: '1.5rem' }}>Statistieken Overzicht</h2>

          {statsLoading || !statsData ? (
            <p>Statistieken laden...</p>
          ) : (
            <>
              {/* Line Chart */}
              <div style={{ marginBottom: '2rem', maxHeight: '350px' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                  Opdrachten & Bids per maand
                </h3>
                <div style={{ height: '300px' }}>
                  <Line data={lineChartData} options={{ maintainAspectRatio: false }} />
                </div>
              </div>

              {/* Pie Chart */}
              <div style={{ marginBottom: '2rem', width: '250px' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                  Opdracht Status Verdeling
                </h3>
                <div style={{ height: '250px' }}>
                  <Pie data={pieChartData} options={{ maintainAspectRatio: false }} />
                </div>
              </div>

              {/* Bar Chart */}
              <div style={{ marginBottom: '2rem', maxHeight: '300px' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                  Top 10 Opdrachten met Hoogste Gemiddelde Bieding
                </h3>
                <div style={{ height: '280px' }}>
                  <Bar data={barChartData} options={{ maintainAspectRatio: false }} />
                </div>
              </div>
            </>
          )}
        </div>

        {/* USER MANAGEMENT */}
        <div className="card round white" style={{
          padding: '2rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          {/* Tabs */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '2rem',
            borderBottom: '2px solid #e0e0e0',
            paddingBottom: '1rem'
          }}>
            <button
              onClick={() => setActiveTab('pending')}
              style={{
                padding: '0.7rem 1.5rem',
                border: 'none',
                backgroundColor: activeTab === 'pending' ? '#ffd700' : 'transparent',
                color: activeTab === 'pending' ? '#333' : '#999',
                cursor: 'pointer',
                fontWeight: 'bold',
                borderRadius: '4px 4px 0 0',
              }}
            >
              📋 In Afwachting ({stats.pending})
            </button>

            <button
              onClick={() => setActiveTab('approved')}
              style={{
                padding: '0.7rem 1.5rem',
                border: 'none',
                backgroundColor: activeTab === 'approved' ? '#51cf66' : 'transparent',
                color: activeTab === 'approved' ? '#fff' : '#999',
                cursor: 'pointer',
                fontWeight: 'bold',
                borderRadius: '4px 4px 0 0',
              }}
            >
              ✅ Goedgekeurd ({stats.approved})
            </button>

            <button
              onClick={() => setActiveTab('all')}
              style={{
                padding: '0.7rem 1.5rem',
                border: 'none',
                backgroundColor: activeTab === 'all' ? '#0066cc' : 'transparent',
                color: activeTab === 'all' ? '#fff' : '#999',
                cursor: 'pointer',
                fontWeight: 'bold',
                borderRadius: '4px 4px 0 0',
              }}
            >
              👥 Alle Gebruikers ({stats.total})
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
                  <tr style={{ borderBottom: '2px solid #0066cc', backgroundColor: '#f5f5f5' }}>
                    <th style={{ padding: '1rem', fontWeight: 'bold' }}>Naam</th>
                    <th style={{ padding: '1rem', fontWeight: 'bold' }}>E-mail</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 'bold' }}>Status</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 'bold' }}>Rol</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 'bold' }}>Lid sinds</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 'bold' }}>Acties</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((u, idx) => (
                    <tr
                      key={u.id}
                      style={{
                        borderBottom: '1px solid #e0e0e0',
                        backgroundColor: idx % 2 === 0 ? '#fff' : '#fafafa'
                      }}
                    >
                      <td style={{ padding: '1rem' }}>
                        <strong>{u.name} {u.last_name}</strong>
                      </td>

                      <td style={{ padding: '1rem', color: '#0066cc' }}>{u.email}</td>

                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        {getStatusBadge(u.status)}
                      </td>

                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <span
                          style={{
                            padding: '0.4rem 0.8rem',
                            borderRadius: '20px',
                            fontWeight: 'bold',
                            backgroundColor: u.is_admin ? '#ff6b6b' : '#51cf66',
                            color: 'white',
                          }}
                        >
                          {u.is_admin ? 'Beheerder' : 'Gebruiker'}
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
                                  padding: '0.4rem 0.8rem',
                                  backgroundColor: '#51cf66',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  fontWeight: 'bold',
                                }}
                              >
                                ✓ Goedkeuren
                              </button>

                              <button
                                onClick={() => handleUserAction(u.id, 'reject')}
                                disabled={actionLoading === u.id}
                                style={{
                                  padding: '0.4rem 0.8rem',
                                  backgroundColor: '#ff6b6b',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  fontWeight: 'bold',
                                }}
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
                                padding: '0.4rem 0.8rem',
                                border: '2px solid #0066cc',
                                borderRadius: '4px',
                                backgroundColor: u.is_poster ? '#51cf66' : 'transparent',
                                color: u.is_poster ? 'white' : '#0066cc',
                                fontWeight: 'bold',
                              }}
                            >
                              {u.is_poster ? '❌ Verwijder poster' : '➕ Maak poster'}
                            </button>
                          )}

                          <button
                            onClick={() => handleUserAction(u.id, 'toggle-admin')}
                            disabled={actionLoading === u.id}
                            style={{
                              padding: '0.4rem 0.8rem',
                              border: '2px solid #ff6b6b',
                              borderRadius: '4px',
                              backgroundColor: 'transparent',
                              color: '#ff6b6b',
                              fontWeight: 'bold',
                            }}
                          >
                            {u.is_admin ? '👤 Gebruiker' : '👑 Beheerder'}
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Verwijder ${u.name}? Dit kan niet ongedaan gemaakt worden.`)) {
                                handleUserAction(u.id, 'delete');
                              }
                            }}
                            disabled={actionLoading === u.id}
                            style={{
                              padding: '0.4rem 0.8rem',
                              backgroundColor: '#999',
                              color: 'white',
                              borderRadius: '4px',
                              fontWeight: 'bold',
                            }}
                          >
                            🗑️ Verwijderen
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
