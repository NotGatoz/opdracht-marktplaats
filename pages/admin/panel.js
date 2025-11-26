import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Navbar, Footer } from '../../components/template';

export default function AdminPanel() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, admins: 0, pending: 0, approved: 0, rejected: 0 });
  const [activeTab, setActiveTab] = useState('pending'); // pending, approved, all
  const [actionLoading, setActionLoading] = useState(null);

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
  }, [router]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data.users || []);
      
      // Calculate stats
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
        await fetchUsers(); // refresh user list
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

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { label: 'In Afwachting', color: '#ffd700', textColor: '#333' },
      approved: { label: 'Goedgekeurd', color: '#51cf66', textColor: 'white' },
      rejected: { label: 'Afgewezen', color: '#ff6b6b', textColor: 'white' },
    };
    const s = statusMap[status] || { label: 'In Afwachting', color: '#ffd700', textColor: '#333' };
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

  return (
    <div className="theme-l5" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <div style={{ flex: 1, padding: '2rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ margin: 0, fontSize: '2.5rem', color: '#333' }}>Beheerdashboard</h1>
          <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>Welkom terug, {user.name}</p>
        </div>

        {/* Statistics Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="card round white" style={{ padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#999', textTransform: 'uppercase' }}>Totaal Gebruikers</p>
            <h2 style={{ margin: '0.5rem 0', fontSize: '2rem', color: '#0066cc' }}>{stats.total}</h2>
          </div>
          <div className="card round white" style={{ padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#999', textTransform: 'uppercase' }}>In Afwachting</p>
            <h2 style={{ margin: '0.5rem 0', fontSize: '2rem', color: '#ffd700' }}>{stats.pending}</h2>
          </div>
          <div className="card round white" style={{ padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#999', textTransform: 'uppercase' }}>Goedgekeurd</p>
            <h2 style={{ margin: '0.5rem 0', fontSize: '2rem', color: '#51cf66' }}>{stats.approved}</h2>
          </div>
          <div className="card round white" style={{ padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#999', textTransform: 'uppercase' }}>Beheerders</p>
            <h2 style={{ margin: '0.5rem 0', fontSize: '2rem', color: '#ff6b6b' }}>{stats.admins}</h2>
          </div>
        </div>

        {/* Tabs and Management */}
        <div className="card round white" style={{ padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          {/* Tab Navigation */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #e0e0e0', paddingBottom: '1rem' }}>
            <button
              onClick={() => setActiveTab('pending')}
              style={{
                padding: '0.7rem 1.5rem',
                border: 'none',
                backgroundColor: activeTab === 'pending' ? '#ffd700' : 'transparent',
                color: activeTab === 'pending' ? '#333' : '#999',
                cursor: 'pointer',
                fontSize: '1rem',
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
                fontSize: '1rem',
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
                color: activeTab === 'all' ? 'white' : '#999',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold',
                borderRadius: '4px 4px 0 0',
              }}
            >
              👥 Alle Gebruikers ({stats.total})
            </button>
          </div>

          {filteredUsers.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>Geen gebruikers gevonden.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #0066cc', backgroundColor: '#f5f5f5' }}>
                    <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 'bold' }}>Naam</th>
                    <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 'bold' }}>E-mail</th>
                    <th style={{ textAlign: 'center', padding: '1rem', fontWeight: 'bold' }}>Status</th>
                    <th style={{ textAlign: 'center', padding: '1rem', fontWeight: 'bold' }}>Rol</th>
                    <th style={{ textAlign: 'center', padding: '1rem', fontWeight: 'bold' }}>Lid sinds</th>
                    <th style={{ textAlign: 'center', padding: '1rem', fontWeight: 'bold' }}>Acties</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u, idx) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid #e0e0e0', backgroundColor: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
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
                            display: 'inline-block',
                            padding: '0.4rem 0.8rem',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: 'bold',
                            backgroundColor: u.is_admin ? '#ff6b6b' : '#51cf66',
                            color: 'white',
                          }}
                        >
                          {u.is_admin ? 'Beheerder' : 'Gebruiker'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center', color: '#999', fontSize: '0.9rem' }}>
                        {new Date(u.created_at).toLocaleDateString('nl-NL')}
                      </td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            {u.status === 'pending' && (
                            <>
                                <button
                                onClick={() => handleUserAction(u.id, 'approve')}
                                disabled={actionLoading === u.id}
                                style={{
                                    padding: '0.4rem 0.8rem',
                                    fontSize: '0.8rem',
                                    border: 'none',
                                    borderRadius: '4px',
                                    backgroundColor: '#51cf66',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    opacity: actionLoading === u.id ? 0.6 : 1,
                                }}
                                >
                                ✓ Goedkeuren
                                </button>
                                <button
                                onClick={() => handleUserAction(u.id, 'reject')}
                                disabled={actionLoading === u.id}
                                style={{
                                    padding: '0.4rem 0.8rem',
                                    fontSize: '0.8rem',
                                    border: 'none',
                                    borderRadius: '4px',
                                    backgroundColor: '#ff6b6b',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    opacity: actionLoading === u.id ? 0.6 : 1,
                                }}
                                >
                                ✗ Afwijzen
                                </button>
                            </>
                            )}

                            {/* Poster role button only for approved users */}
                            {u.status === 'approved' && (
                            <button
                                onClick={() => handlePosterRole(u.id, !u.is_poster)}
                                disabled={actionLoading === u.id}
                                style={{
                                padding: '0.4rem 0.8rem',
                                fontSize: '0.8rem',
                                border: '2px solid #0066cc',
                                borderRadius: '4px',
                                backgroundColor: u.is_poster ? '#51cf66' : 'transparent',
                                color: u.is_poster ? 'white' : '#0066cc',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                opacity: actionLoading === u.id ? 0.6 : 1,
                                }}
                            >
                                {u.is_poster ? '❌ Remove Poster' : '➕ Make Poster'}
                            </button>
                            )}
                            
                            <button
                            onClick={() => handleUserAction(u.id, 'toggle-admin')}
                            disabled={actionLoading === u.id}
                            style={{
                                padding: '0.4rem 0.8rem',
                                fontSize: '0.8rem',
                                border: '2px solid #ff6b6b',
                                borderRadius: '4px',
                                backgroundColor: 'transparent',
                                color: '#ff6b6b',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                opacity: actionLoading === u.id ? 0.6 : 1,
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
                                fontSize: '0.8rem',
                                border: 'none',
                                borderRadius: '4px',
                                backgroundColor: '#999',
                                color: 'white',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                opacity: actionLoading === u.id ? 0.6 : 1,
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
