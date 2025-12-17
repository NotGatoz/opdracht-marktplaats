import React, { useState, useEffect } from 'react';
import { Navbar, Footer } from '../../components/template';

export default function OpdrachtenPage() {
  const [opdrachten, setOpdrachten] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOpdracht, setSelectedOpdracht] = useState(null);
  const [user, setUser] = useState(null);
  const [newBid, setNewBid] = useState('');
  const [bidComment, setBidComment] = useState('');
  const [bids, setBids] = useState([]);
  const [bidLoading, setBidLoading] = useState(false);
  const [hasBid, setHasBid] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBidFilter, setSelectedBidFilter] = useState('');
  const [selectedSortFilter, setSelectedSortFilter] = useState('');
  const [showMessagePopup, setShowMessagePopup] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [messageLoading, setMessageLoading] = useState(false);


  useEffect(() => {
    const fetchUser = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        } catch (err) {
          console.error('Error parsing user:', err);
        }
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchOpdrachten = async () => {
      try {
        const userId = user?.id;
        const url = userId ? `/api/opdracht/opdrachten?userId=${userId}` : '/api/opdracht/opdrachten';
        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Fout bij ophalen opdrachten');
        setOpdrachten(data.opdrachten);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOpdrachten();
  }, [user]);

  const fetchBids = async (opdrachtId) => {
    try {
      const res = await fetch(`/api/bids?opdrachtId=${opdrachtId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Fout bij ophalen biedingen');
      setBids(data.bids);
      setHasBid(data.bids.some(bid => bid.user_id == user?.id));
    } catch (err) {
      console.error(err.message);
      setBids([]);
      setHasBid(false);
    }
  };

  const handleBidSubmit = async () => {
    if (!newBid || Number(newBid) <= 0) return;
    // Check if user has already bid to prevent frontend submission
    if (bids.some(bid => bid.user_id == user?.id)) {
      alert('Je hebt al een bod geplaatst op deze opdracht');
      return;
    }
    setBidLoading(true);
    try {
      const res = await fetch('/api/bids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opdrachtId: selectedOpdracht.id,
          userId: user.id,
          amount: Number(newBid),
          comment: bidComment,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Fout bij plaatsen bod');
      setNewBid('');
      setBidComment('');
      fetchBids(selectedOpdracht.id); // Refresh bids after successful submission
    } catch (err) {
      alert(err.message);
    } finally {
      setBidLoading(false);
    }
  };

  const openModal = (opdracht) => {
    setSelectedOpdracht(opdracht);
    fetchBids(opdracht.id);
  };

  const fetchOpdrachten = async () => {
    try {
      const userId = user?.id;
      const url = userId ? `/api/opdracht/opdrachten?userId=${userId}` : '/api/opdracht/opdrachten';
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Fout bij ophalen opdrachten');
      setOpdrachten(data.opdrachten);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBidAction = async (action, bidId) => {
    try {
      const res = await fetch('/api/bid-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          bidId,
          opdrachtId: selectedOpdracht.id,
          userId: user?.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Fout bij actie');
      fetchBids(selectedOpdracht.id); // Refresh bids
      fetchOpdrachten(); // Refresh opdrachten to update "geboden" indicator
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    if (showMessagePopup && selectedOpdracht) {
      fetchMessages();
    }
  }, [showMessagePopup, selectedOpdracht]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/messages/get?opdrachtId=${selectedOpdracht.id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Fout bij ophalen berichten');
      setMessages(data.messages);
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    setMessageLoading(true);
    try {
      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opdrachtId: selectedOpdracht.id,
          userId: user.id,
          message: newMessage,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Fout bij verzenden bericht');
      setNewMessage('');
      fetchMessages(); // Refresh messages
    } catch (err) {
      alert(err.message);
    } finally {
      setMessageLoading(false);
    }
  };





  const filteredOpdrachten = opdrachten
    .filter((opdracht) => {
      if (opdracht.status === 'aangenomen') return false;

      const matchesSearch = searchQuery === '' ||
        opdracht.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opdracht.description.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (!selectedBidFilter) return true;

      if (selectedBidFilter === 'ik geboden') return user && Number(opdracht.user_bid_count) > 0;

      return true;
    })
    .sort((a, b) => {
      if (selectedSortFilter === 'nieuw') {
        return new Date(b.created_at) - new Date(a.created_at);
      } else if (selectedSortFilter === 'oud') {
        return new Date(a.created_at) - new Date(b.created_at);
      }
      return 0;
    });

  return (
    <div className="theme-l5" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <div style={{ flex: 1, display: 'flex', marginTop: '80px' }}>
        <div style={{ width: '250px', backgroundColor: '#f8f9fa', borderRight: '1px solid #e0e0e0', padding: '2rem', minHeight: '100vh', overflowY: 'auto' }}>
          <h3 style={{ marginBottom: '1.5rem', color: '#333', fontSize: '1.1rem', fontWeight: 600 }}>Zoeken & Filteren</h3>
          
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#555', fontSize: '0.9rem' }}>Zoeken</label>
            <input
              type="text"
              placeholder="Zoek opdrachten..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ 
                padding: '0.7rem', 
                width: '100%', 
                borderRadius: '6px', 
                border: '1px solid #ddd', 
                fontSize: '0.9rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <h4 style={{ marginBottom: '1rem', color: '#333', fontSize: '0.95rem', fontWeight: 600 }}>Filters</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '0.5rem' }}>
                <input
                  type="radio"
                  name="bid-filter"
                  value=""
                  checked={selectedBidFilter === ''}
                  onChange={(e) => setSelectedBidFilter(e.target.value)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{ color: '#555', fontSize: '0.9rem' }}>Alle</span>
              </label>
              {[
                { id: 'ik geboden', label: 'Ik heb geboden' },
              ].map((filter) => (
                <label key={filter.id} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '0.5rem' }}>
                  <input
                    type="radio"
                    name="bid-filter"
                    value={filter.id}
                    checked={selectedBidFilter === filter.id}
                    onChange={(e) => setSelectedBidFilter(e.target.value)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span style={{ color: '#555', fontSize: '0.9rem' }}>{filter.label}</span>
                </label>
              ))}
            </div>
          </div>

          <hr style={{ margin: '1.5rem 0', borderColor: '#e0e0e0' }} />

          <div>
            <h4 style={{ marginBottom: '1rem', color: '#333', fontSize: '0.95rem', fontWeight: 600 }}>Sorteren</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '0.5rem' }}>
                <input
                  type="radio"
                  name="sort-filter"
                  value=""
                  checked={selectedSortFilter === ''}
                  onChange={(e) => setSelectedSortFilter(e.target.value)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{ color: '#555', fontSize: '0.9rem' }}>Standaard</span>
              </label>
              {[
                { id: 'nieuw', label: 'Nieuwste' },
                { id: 'oud', label: 'Oudste' },
              ].map((sort) => (
                <label key={sort.id} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '0.5rem' }}>
                  <input
                    type="radio"
                    name="sort-filter"
                    value={sort.id}
                    checked={selectedSortFilter === sort.id}
                    onChange={(e) => setSelectedSortFilter(e.target.value)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span style={{ color: '#555', fontSize: '0.9rem' }}>{sort.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>Opdrachten</h1>
            <p style={{ color: '#999', margin: 0 }}>
              {filteredOpdrachten.length} {filteredOpdrachten.length === 1 ? 'opdracht' : 'opdrachten'} gevonden
            </p>
          </div>

          {loading && <p style={{ color: '#666' }}>Laden...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {filteredOpdrachten.map((opdracht) => (
              <div
                key={opdracht.id}
                onClick={() => openModal(opdracht)}
                style={{
                  padding: '1.5rem',
                  cursor: 'pointer',
                  position: 'relative',
                  backgroundColor: 'white',
                  borderRadius: '10px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                  border: '1px solid #f0f0f0',
                  ':hover': {
                    boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
                    transform: 'translateY(-2px)'
                  }
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {opdracht.total_bid_count > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    backgroundColor: '#ff6b6b',
                    color: 'white',
                    padding: '0.35rem 0.65rem',
                    borderRadius: '20px',
                    fontWeight: 600,
                    fontSize: '0.8rem'
                  }}>
                    {opdracht.total_bid_count} {opdracht.total_bid_count === 1 ? 'bod' : 'boden'}
                  </div>
                )}
                
                <div style={{ marginBottom: '1rem' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#333', fontSize: '1.1rem', fontWeight: 600 }}>
                    {opdracht.title}
                  </h3>
                  <p style={{ margin: 0, color: '#666', fontSize: '0.9rem', lineHeight: '1.4' }}>
                    {opdracht.description.substring(0, 100)}...
                  </p>
                </div>

                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: '1rem', 
                  marginBottom: '1rem',
                  fontSize: '0.85rem'
                }}>
                  <div>
                    <span style={{ color: '#999', display: 'block', marginBottom: '0.2rem' }}>Deadline</span>
                    <span style={{ color: '#333', fontWeight: 500 }}>
                      {new Date(opdracht.deadline).toLocaleDateString('nl-NL')}
                    </span>
                  </div>
                  {opdracht.location_city && (
                    <div>
                      <span style={{ color: '#999', display: 'block', marginBottom: '0.2rem' }}>Locatie</span>
                      <span style={{ color: '#333', fontWeight: 500 }}>
                        {opdracht.location_city}
                      </span>
                    </div>
                  )}
                </div>

                <div style={{ 
                  paddingTop: '1rem', 
                  borderTop: '1px solid #f0f0f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{
                    display: 'inline-block',
                    backgroundColor: '#e3f2fd',
                    color: '#1976d2',
                    padding: '0.35rem 0.65rem',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    fontWeight: 500
                  }}>
                    {opdracht.status}
                  </span>
                  <span style={{ color: '#1976d2', fontSize: '0.9rem', fontWeight: 500 }}>
                    Meer info →
                  </span>
                </div>
              </div>
            ))}
          </div>

          {filteredOpdrachten.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
              <p style={{ fontSize: '1.1rem' }}>Geen opdrachten gevonden</p>
            </div>
          )}
        </div>
      </div>

      <Footer />

      {selectedOpdracht && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
          onClick={() => setSelectedOpdracht(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              maxWidth: '1000px',
              width: '95%',
              padding: '2rem',
              position: 'relative',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <button
              onClick={() => setSelectedOpdracht(null)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'red',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Sluiten
            </button>

            <h2 style={{ marginBottom: '1.5rem' }}>{selectedOpdracht.title}</h2>

            <div style={{ 
              backgroundColor: 'white', 
              padding: '1.5rem', 
              borderRadius: '8px', 
              marginBottom: '1.5rem',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              <h4 style={{ marginTop: 0, marginBottom: '1rem', color: '#333' }}>
                Basis Informatie
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <p style={{ margin: '0.25rem 0', color: '#666' }}><strong>Beschrijving:</strong></p>
                  <p style={{ margin: '0', color: '#333' }}>{selectedOpdracht.description}</p>
                </div>
                <div>
                  <p style={{ margin: '0.25rem 0', color: '#666' }}><strong>Categorie:</strong></p>
                  <p style={{ margin: '0', color: '#333' }}>{selectedOpdracht.category || 'Geen'}</p>
                </div>
                <div>
                  <p style={{ margin: '0.25rem 0', color: '#666' }}><strong>Deadline:</strong></p>
                  <p style={{ margin: '0', color: '#333' }}>{new Date(selectedOpdracht.deadline).toLocaleDateString()}</p>
                </div>
                <div>
                  <p style={{ margin: '0.25rem 0', color: '#666' }}><strong>Status:</strong></p>
                  <p style={{ margin: '0', color: '#333' }}>{selectedOpdracht.status}</p>
                </div>
                <div>
                  <p style={{ margin: '0.25rem 0', color: '#666' }}><strong>Aangemaakt:</strong></p>
                  <p style={{ margin: '0', color: '#333' }}>{new Date(selectedOpdracht.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div style={{ 
              backgroundColor: 'white', 
              padding: '1.5rem', 
              borderRadius: '8px', 
              marginBottom: '1.5rem',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              <h4 style={{ marginTop: 0, marginBottom: '1rem', color: '#333' }}>
                Locatie
              </h4>
              <p style={{ margin: '0', color: '#333' }}>{selectedOpdracht.location_city ? `${selectedOpdracht.location_city}, ${selectedOpdracht.location_address}, ${selectedOpdracht.location_postcode}` : 'Geen'}</p>
            </div>

            <div style={{ 
              backgroundColor: 'white', 
              padding: '1.5rem', 
              borderRadius: '8px', 
              marginBottom: '1.5rem',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              <h4 style={{ marginTop: 0, marginBottom: '1rem', color: '#333' }}>
                Opbouw
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <p style={{ margin: '0.25rem 0', color: '#666' }}><strong>Datum:</strong></p>
                  <p style={{ margin: '0', color: '#333' }}>{selectedOpdracht.opbouw_date ? new Date(selectedOpdracht.opbouw_date).toLocaleDateString() : 'Niet opgegeven'}</p>
                </div>
                <div>
                  <p style={{ margin: '0.25rem 0', color: '#666' }}><strong>Tijd:</strong></p>
                  <p style={{ margin: '0', color: '#333' }}>{selectedOpdracht.opbouw_time || 'Niet opgegeven'}</p>
                </div>
                <div>
                  <p style={{ margin: '0.25rem 0', color: '#666' }}><strong>Hard Opbouw:</strong></p>
                  <p style={{ margin: '0', color: '#333' }}>{selectedOpdracht.hard_opbouw || 'Niet opgegeven'}</p>
                </div>
                <div>
                  <p style={{ margin: '0.25rem 0', color: '#666' }}><strong>Dagen Aantal:</strong></p>
                  <p style={{ margin: '0', color: '#333' }}>{selectedOpdracht.opbouw_dagen_amount || 'Niet opgegeven'}</p>
                </div>
                <div>
                  <p style={{ margin: '0.25rem 0', color: '#666' }}><strong>Mannen Nodig:</strong></p>
                  <p style={{ margin: '0', color: '#333' }}>{selectedOpdracht.opbouw_men_needed || 'Niet opgegeven'}</p>
                </div>
              </div>
            </div>

            <div style={{ 
              backgroundColor: 'white', 
              padding: '1.5rem', 
              borderRadius: '8px', 
              marginBottom: '1.5rem',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              <h4 style={{ marginTop: 0, marginBottom: '1rem', color: '#333' }}>
                Afbouw
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <p style={{ margin: '0.25rem 0', color: '#666' }}><strong>Datum:</strong></p>
                  <p style={{ margin: '0', color: '#333' }}>{selectedOpdracht.planning_afbouw_date ? new Date(selectedOpdracht.planning_afbouw_date).toLocaleDateString() : 'Niet opgegeven'}</p>
                </div>
                <div>
                  <p style={{ margin: '0.25rem 0', color: '#666' }}><strong>Tijd:</strong></p>
                  <p style={{ margin: '0', color: '#333' }}>{selectedOpdracht.planning_afbouw_time || 'Niet opgegeven'}</p>
                </div>
                <div>
                  <p style={{ margin: '0.25rem 0', color: '#666' }}><strong>Hard Afbouw:</strong></p>
                  <p style={{ margin: '0', color: '#333' }}>{selectedOpdracht.hard_afbouw || 'Niet opgegeven'}</p>
                </div>
                <div>
                  <p style={{ margin: '0.25rem 0', color: '#666' }}><strong>Dagen Aantal:</strong></p>
                  <p style={{ margin: '0', color: '#333' }}>{selectedOpdracht.afbouw_dagen_amount || 'Niet opgegeven'}</p>
                </div>
                <div>
                  <p style={{ margin: '0.25rem 0', color: '#666' }}><strong>Mannen Nodig:</strong></p>
                  <p style={{ margin: '0', color: '#333' }}>{selectedOpdracht.afbouw_men_needed || 'Niet opgegeven'}</p>
                </div>
              </div>
            </div>

            <div style={{ 
              backgroundColor: 'white', 
              padding: '1.5rem', 
              borderRadius: '8px', 
              marginBottom: '1.5rem',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              <h4 style={{ marginTop: 0, marginBottom: '1rem', color: '#333' }}>
                Transport
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <p style={{ margin: '0.25rem 0', color: '#666' }}><strong>Opbouw Type:</strong></p>
                  <p style={{ margin: '0', color: '#333' }}>{selectedOpdracht.opbouw_transport_type || 'Niet opgegeven'}</p>
                </div>
                <div>
                  <p style={{ margin: '0.25rem 0', color: '#666' }}><strong>Opbouw Aantal:</strong></p>
                  <p style={{ margin: '0', color: '#333' }}>{selectedOpdracht.opbouw_transport_amount || 'Niet opgegeven'}</p>
                </div>
                <div>
                  <p style={{ margin: '0.25rem 0', color: '#666' }}><strong>Afbouw Type:</strong></p>
                  <p style={{ margin: '0', color: '#333' }}>{selectedOpdracht.afbouw_transport_type || 'Niet opgegeven'}</p>
                </div>
                <div>
                  <p style={{ margin: '0.25rem 0', color: '#666' }}><strong>Afbouw Aantal:</strong></p>
                  <p style={{ margin: '0', color: '#333' }}>{selectedOpdracht.afbouw_transport_amount || 'Niet opgegeven'}</p>
                </div>
              </div>
            </div>

            <div style={{ 
              backgroundColor: 'white', 
              padding: '1.5rem', 
              borderRadius: '8px', 
              marginBottom: '1.5rem',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              <h4 style={{ marginTop: 0, marginBottom: '1rem', color: '#333' }}>
                Hoogwerkers
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <p style={{ margin: '0.25rem 0', color: '#666' }}><strong>Opbouw Type:</strong></p>
                  <p style={{ margin: '0', color: '#333' }}>{selectedOpdracht.opbouw_hoogwerkers_type || 'Niet opgegeven'}</p>
                </div>
                <div>
                  <p style={{ margin: '0.25rem 0', color: '#666' }}><strong>Opbouw Aantal:</strong></p>
                  <p style={{ margin: '0', color: '#333' }}>{selectedOpdracht.opbouw_hoogwerkers_amount || 'Niet opgegeven'}</p>
                </div>
                <div>
                  <p style={{ margin: '0.25rem 0', color: '#666' }}><strong>Afbouw Type:</strong></p>
                  <p style={{ margin: '0', color: '#333' }}>{selectedOpdracht.afbouw_hoogwerkers_type || 'Niet opgegeven'}</p>
                </div>
                <div>
                  <p style={{ margin: '0.25rem 0', color: '#666' }}><strong>Afbouw Aantal:</strong></p>
                  <p style={{ margin: '0', color: '#333' }}>{selectedOpdracht.afbouw_hoogwerkers_amount || 'Niet opgegeven'}</p>
                </div>
              </div>
            </div>

            <div style={{ 
              backgroundColor: 'white', 
              padding: '1.5rem', 
              borderRadius: '8px', 
              marginBottom: '1.5rem',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              <h4 style={{ marginTop: 0, marginBottom: '1rem', color: '#333' }}>
                Links en Opslag
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <p style={{ margin: '0.25rem 0', color: '#666' }}><strong>Magazijnbon Link:</strong></p>
                  <p style={{ margin: '0', color: '#333' }}>{selectedOpdracht.magazijnbon_link ? <a href={selectedOpdracht.magazijnbon_link} target="_blank" rel="noopener noreferrer">Bekijk</a> : 'Niet opgegeven'}</p>
                </div>
                <div>
                  <p style={{ margin: '0.25rem 0', color: '#666' }}><strong>Project Map Opbouw Link:</strong></p>
                  <p style={{ margin: '0', color: '#333' }}>{selectedOpdracht.project_map_opbouw_link ? <a href={selectedOpdracht.project_map_opbouw_link} target="_blank" rel="noopener noreferrer">Bekijk</a> : 'Niet opgegeven'}</p>
                </div>
                <div>
                  <p style={{ margin: '0.25rem 0', color: '#666' }}><strong>Project Map Afbouw Link:</strong></p>
                  <p style={{ margin: '0', color: '#333' }}>{selectedOpdracht.project_map_afbouw_link ? <a href={selectedOpdracht.project_map_afbouw_link} target="_blank" rel="noopener noreferrer">Bekijk</a> : 'Niet opgegeven'}</p>
                </div>
                <div>
                  <p style={{ margin: '0.25rem 0', color: '#666' }}><strong>Storageplace Adres:</strong></p>
                  <p style={{ margin: '0', color: '#333' }}>{selectedOpdracht.storageplace_adres || 'Niet opgegeven'}</p>
                </div>
              </div>
            </div>

            {((selectedOpdracht.images && selectedOpdracht.images.length > 0) || (selectedOpdracht.pdfs && selectedOpdracht.pdfs.length > 0)) && (
              <div style={{ 
                backgroundColor: 'white', 
                padding: '1.5rem', 
                borderRadius: '8px', 
                marginBottom: '1.5rem',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}>
                <h4 style={{ marginTop: 0, marginBottom: '1rem', color: '#333' }}>
                  Bijlagen
                </h4>
                {selectedOpdracht.images && selectedOpdracht.images.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <h5 style={{ marginTop: 0, marginBottom: '0.5rem' }}>Afbeeldingen:</h5>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {selectedOpdracht.images.map((image, index) => (
                        <img
                          key={index}
                          src={`data:image/jpeg;base64,${image}`}
                          alt={`Afbeelding ${index + 1}`}
                          style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {selectedOpdracht.pdfs && selectedOpdracht.pdfs.length > 0 && (
                  <div>
                    <h5 style={{ marginTop: 0, marginBottom: '0.5rem' }}>PDFs:</h5>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {selectedOpdracht.pdfs.map((pdf, index) => (
                        <a
                          key={index}
                          href={`/api/opdracht/pdf?id=${selectedOpdracht.id}&index=${index}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ padding: '0.5rem 1rem', backgroundColor: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '4px' }}
                        >
                          {selectedOpdracht.pdf_filenames && selectedOpdracht.pdf_filenames[index] ? selectedOpdracht.pdf_filenames[index] : `PDF ${index + 1} bekijken`}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}



            {!user?.is_poster && (
              <div style={{ marginTop: '1rem' }}>
                <button
                  onClick={() => setShowMessagePopup(true)}
                  style={{ padding: '0.5rem 1rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '0.5rem' }}
                >
                  Contact
                </button>
                {hasBid ? (
                  <button
                    onClick={() => {
                      if (confirm('Weet je zeker dat je je bod wilt verwijderen?')) {
                        handleBidAction('ignore', null);
                      }
                    }}
                    style={{ padding: '0.5rem 1rem', backgroundColor: '#ff6b6b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Bod verwijderen
                  </button>
                ) : (
                  <>
                    <h3>Plaats je bod</h3>
                    <input
                      type="number"
                      value={newBid}
                      onChange={(e) => setNewBid(e.target.value)}
                      placeholder="Bedrag (€)"
                      style={{ padding: '0.5rem', width: '100%', marginBottom: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                    <textarea
                      value={bidComment}
                      onChange={(e) => setBidComment(e.target.value)}
                      placeholder="Opmerking (optioneel)"
                      style={{ padding: '0.5rem', width: '100%', marginBottom: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', minHeight: '60px' }}
                    />
                    <button
                      onClick={handleBidSubmit}
                      disabled={bidLoading}
                      style={{ padding: '0.5rem 1rem', backgroundColor: '#51cf66', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      {bidLoading ? 'Bezig...' : 'Bod plaatsen'}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {showMessagePopup && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1001,
          }}
          onClick={() => setShowMessagePopup(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              maxWidth: '500px',
              width: '90%',
              padding: '2rem',
              position: 'relative',
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
          >
            <button
              onClick={() => setShowMessagePopup(false)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'red',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Sluiten
            </button>

            <h3>Contact Opdrachtgever</h3>

            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Typ je bericht..."
              style={{ padding: '0.5rem', width: '100%', marginBottom: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', minHeight: '80px' }}
            />
            <button
              onClick={handleSendMessage}
              disabled={messageLoading}
              style={{ padding: '0.5rem 1rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              {messageLoading ? 'Verzenden...' : 'Verzenden'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
